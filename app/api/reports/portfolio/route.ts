import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export async function GET() {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Fetch portfolio data
    const properties = await prisma.asset.findMany({
      where: {
        userId: session.user.id,
        assetType: 'real_estate',
      },
      include: {
        realEstateProperty: {
          include: {
            mortgages: true,
            expenses: true,
          },
        },
        incomeStreams: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    // Calculate portfolio metrics
    const totalValue = properties.reduce((sum, p) => sum + Number(p.currentValue), 0)
    const totalCostBasis = properties.reduce((sum, p) => sum + Number(p.costBasis), 0)
    const totalDebt = properties.reduce((sum, p) => {
      const mortgageDebt = p.realEstateProperty?.mortgages.reduce(
        (mSum, m) => mSum + Number(m.currentBalance),
        0
      ) || 0
      return sum + mortgageDebt
    }, 0)
    const totalEquity = totalValue - totalDebt
    const totalAppreciation = totalValue - totalCostBasis
    const appreciationPercent = totalCostBasis > 0 ? (totalAppreciation / totalCostBasis) * 100 : 0

    // Calculate monthly cash flow
    const monthlyIncome = properties.reduce((sum, p) => {
      const propertyIncome = p.incomeStreams.reduce((iSum, income) => {
        const today = new Date()
        const incomeStart = new Date(income.startDate)
        const incomeEnd = income.endDate ? new Date(income.endDate) : null
        const isActive = incomeStart <= today && (!incomeEnd || incomeEnd >= today)

        if (isActive && income.isRecurring) {
          const monthlyAmount = income.frequency === 'MONTHLY' ? Number(income.amount) :
                              income.frequency === 'QUARTERLY' ? Number(income.amount) / 3 :
                              income.frequency === 'ANNUALLY' ? Number(income.amount) / 12 : 0
          return iSum + monthlyAmount
        }
        return iSum
      }, 0)
      return sum + propertyIncome
    }, 0)

    const monthlyExpenses = properties.reduce((sum, p) => {
      const propertyExpenses = p.realEstateProperty?.expenses.reduce((eSum, expense) => {
        const today = new Date()
        const expenseDate = new Date(expense.date)
        if (expense.recurring && expenseDate <= today) {
          return eSum + Number(expense.amount)
        }
        return eSum
      }, 0) || 0
      return sum + propertyExpenses
    }, 0)

    const monthlyMortgagePayments = properties.reduce((sum, p) => {
      const propertyPayments = p.realEstateProperty?.mortgages.reduce(
        (mSum, m) => mSum + Number(m.monthlyPayment),
        0
      ) || 0
      return sum + propertyPayments
    }, 0)

    const netMonthlyCashFlow = monthlyIncome - monthlyExpenses - monthlyMortgagePayments

    // Generate PDF
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()

    // Header
    doc.setFontSize(20)
    doc.text('Real Estate Portfolio Report', pageWidth / 2, 20, { align: 'center' })

    doc.setFontSize(10)
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, 28, { align: 'center' })
    doc.text(`Investor: ${session.user.name || session.user.email}`, pageWidth / 2, 34, { align: 'center' })

    // Portfolio Summary
    doc.setFontSize(14)
    doc.text('Portfolio Summary', 14, 45)

    const formatCurrency = (value: number) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value)
    }

    const formatPercent = (value: number) => {
      return new Intl.NumberFormat('en-US', {
        style: 'percent',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(value / 100)
    }

    autoTable(doc, {
      startY: 50,
      head: [['Metric', 'Value']],
      body: [
        ['Total Properties', properties.length.toString()],
        ['Total Portfolio Value', formatCurrency(totalValue)],
        ['Total Cost Basis', formatCurrency(totalCostBasis)],
        ['Total Appreciation', `${formatCurrency(totalAppreciation)} (${formatPercent(appreciationPercent)})`],
        ['Total Debt', formatCurrency(totalDebt)],
        ['Total Equity', formatCurrency(totalEquity)],
        ['Monthly Income', formatCurrency(monthlyIncome)],
        ['Monthly Expenses', formatCurrency(monthlyExpenses)],
        ['Monthly Mortgage Payments', formatCurrency(monthlyMortgagePayments)],
        ['Net Monthly Cash Flow', formatCurrency(netMonthlyCashFlow)],
      ],
      theme: 'striped',
      headStyles: { fillColor: [79, 70, 229] },
    })

    // Property Details
    doc.setFontSize(14)
    const finalY = (doc as any).lastAutoTable.finalY || 50
    doc.text('Property Details', 14, finalY + 15)

    const propertyRows = properties.map((property) => {
      const reProperty = property.realEstateProperty
      const mortgageDebt = reProperty?.mortgages.reduce(
        (sum, m) => sum + Number(m.currentBalance),
        0
      ) || 0
      const equity = Number(property.currentValue) - mortgageDebt
      const appreciation = Number(property.currentValue) - Number(property.costBasis)
      const appreciationPct = Number(property.costBasis) > 0
        ? (appreciation / Number(property.costBasis)) * 100
        : 0

      return [
        property.name,
        reProperty ? `${reProperty.address}, ${reProperty.city}, ${reProperty.state}` : 'N/A',
        formatCurrency(Number(property.currentValue)),
        formatCurrency(Number(property.costBasis)),
        `${formatCurrency(appreciation)} (${formatPercent(appreciationPct)})`,
        formatCurrency(mortgageDebt),
        formatCurrency(equity),
      ]
    })

    autoTable(doc, {
      startY: finalY + 20,
      head: [['Property', 'Address', 'Current Value', 'Cost Basis', 'Appreciation', 'Debt', 'Equity']],
      body: propertyRows,
      theme: 'striped',
      headStyles: { fillColor: [79, 70, 229] },
      styles: { fontSize: 8 },
      columnStyles: {
        0: { cellWidth: 30 },
        1: { cellWidth: 40 },
        2: { cellWidth: 22 },
        3: { cellWidth: 22 },
        4: { cellWidth: 28 },
        5: { cellWidth: 20 },
        6: { cellWidth: 20 },
      },
    })

    // Individual Property Breakdowns (if space allows, add new page)
    doc.addPage()
    doc.setFontSize(14)
    doc.text('Property Financial Details', 14, 20)

    let currentY = 30

    properties.forEach((property, index) => {
      const reProperty = property.realEstateProperty

      if (currentY > 250) {
        doc.addPage()
        currentY = 20
      }

      doc.setFontSize(12)
      doc.text(`${index + 1}. ${property.name}`, 14, currentY)
      currentY += 8

      // Property income
      const propertyIncome = property.incomeStreams
        .filter(i => i.isRecurring)
        .map(income => {
          const monthlyAmount = income.frequency === 'MONTHLY' ? Number(income.amount) :
                              income.frequency === 'QUARTERLY' ? Number(income.amount) / 3 :
                              income.frequency === 'ANNUALLY' ? Number(income.amount) / 12 : 0
          return [income.name, income.frequency, formatCurrency(Number(income.amount)), formatCurrency(monthlyAmount)]
        })

      if (propertyIncome.length > 0) {
        autoTable(doc, {
          startY: currentY,
          head: [['Income Stream', 'Frequency', 'Amount', 'Monthly']],
          body: propertyIncome,
          theme: 'plain',
          styles: { fontSize: 9 },
          margin: { left: 20 },
        })
        currentY = (doc as any).lastAutoTable.finalY + 5
      }

      // Property mortgages
      const mortgages = reProperty?.mortgages || []
      if (mortgages.length > 0) {
        const mortgageRows = mortgages.map(m => [
          m.lender,
          m.loanType,
          formatCurrency(Number(m.currentBalance)),
          formatPercent(Number(m.interestRate)),
          formatCurrency(Number(m.monthlyPayment)),
        ])

        autoTable(doc, {
          startY: currentY,
          head: [['Lender', 'Type', 'Balance', 'Rate', 'Payment']],
          body: mortgageRows,
          theme: 'plain',
          styles: { fontSize: 9 },
          margin: { left: 20 },
        })
        currentY = (doc as any).lastAutoTable.finalY + 5
      }

      currentY += 5
    })

    // Footer
    const pageCount = doc.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFontSize(8)
      doc.text(
        `Page ${i} of ${pageCount}`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      )
    }

    // Generate buffer
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'))

    // Return PDF
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="portfolio-report-${new Date().toISOString().split('T')[0]}.pdf"`,
      },
    })
  } catch (error) {
    console.error('Error generating portfolio report:', error)
    return NextResponse.json(
      { error: 'Failed to generate portfolio report' },
      { status: 500 }
    )
  }
}
