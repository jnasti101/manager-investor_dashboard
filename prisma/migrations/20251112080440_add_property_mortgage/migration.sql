-- CreateTable
CREATE TABLE "PropertyMortgage" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "lender" TEXT NOT NULL,
    "loanType" TEXT NOT NULL,
    "originalAmount" DECIMAL(15,2) NOT NULL,
    "currentBalance" DECIMAL(15,2) NOT NULL,
    "interestRate" DECIMAL(5,3) NOT NULL,
    "termMonths" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "monthlyPayment" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PropertyMortgage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PropertyMortgage_propertyId_idx" ON "PropertyMortgage"("propertyId");

-- AddForeignKey
ALTER TABLE "PropertyMortgage" ADD CONSTRAINT "PropertyMortgage_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "RealEstateProperty"("id") ON DELETE CASCADE ON UPDATE CASCADE;
