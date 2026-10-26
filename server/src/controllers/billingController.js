const { db } = require('../db');

// GET /api/billing
const getBills = async (req, res) => {
  try {
    const user = req.user;
    let targetStudentId = user.id;

    if (user.role === 'PARENT') {
      // Find parent's ward/student
      const parentUser = await db.user.findUnique({ where: { id: user.id } });
      targetStudentId = parentUser?.childId || 'student-uuid-201';
    } else if (user.role === 'TEACHER' || user.role === 'ADMIN') {
      // Teachers or admin can view all or specify studentId query
      targetStudentId = req.query.studentId || null;
    }

    let bills;
    if (targetStudentId) {
      bills = await db.bill.findMany({ where: { studentId: targetStudentId } });
    } else {
      bills = await db.bill.findMany();
    }

    const studentUser = targetStudentId
      ? await db.user.findUnique({ where: { id: targetStudentId } })
      : null;

    // Calculate billing summary
    let totalOutstanding = 0;
    let totalPaid = 0;
    let unpaidCount = 0;
    let paidCount = 0;
    let nextDueDate = null;

    bills.forEach((bill) => {
      const amt = Number(bill.amount) || 0;
      if (bill.status === 'PAID') {
        totalPaid += amt;
        paidCount++;
      } else {
        totalOutstanding += amt;
        unpaidCount++;
        const due = new Date(bill.dueDate);
        if (!nextDueDate || due < new Date(nextDueDate)) {
          nextDueDate = bill.dueDate;
        }
      }
    });

    return res.json({
      bills,
      summary: {
        totalOutstanding,
        totalPaid,
        unpaidCount,
        paidCount,
        totalBillsCount: bills.length,
        nextDueDate,
      },
      student: studentUser
        ? {
          id: studentUser.id,
          name: studentUser.name,
          email: studentUser.email,
          studentCode: 'GIS-STU-2026',
          grade: 'Grade 10 - Science Stream',
        }
        : null,
    });
  } catch (error) {
    console.error('Get bills error:', error);
    return res.status(500).json({ error: 'Failed to retrieve billing records.' });
  }
};

// POST /api/billing/pay/:id
const payBill = async (req, res) => {
  try {
    const billId = req.params.id;
    const { paymentMethod, payerName } = req.body;

    const bill = await db.bill.findUnique({ where: { id: billId } });
    if (!bill) {
      return res.status(404).json({ error: 'Bill invoice not found.' });
    }

    if (bill.status === 'PAID') {
      return res.status(400).json({ error: 'This invoice has already been paid in full.' });
    }

    const transactionRef = 'TXN-' + Math.floor(10000000 + Math.random() * 90000000);
    const updated = await db.bill.update({
      where: { id: billId },
      data: {
        status: 'PAID',
        paidAt: new Date(),
        paymentMethod: paymentMethod || 'Online Card Payment',
        transactionRef,
        payerName: payerName || req.user.name,
      },
    });

    return res.json({
      success: true,
      message: `Payment of $${updated.amount.toFixed(2)} processed successfully!`,
      bill: updated,
    });
  } catch (error) {
    console.error('Pay bill error:', error);
    return res.status(500).json({ error: 'Payment processing failed. Please try again.' });
  }
};

// GET /api/billing/receipt/:id
const getReceipt = async (req, res) => {
  try {
    const billId = req.params.id;
    const bill = await db.bill.findUnique({ where: { id: billId } });

    if (!bill) {
      return res.status(404).json({ error: 'Invoice receipt not found.' });
    }

    const receipt = {
      receiptNumber: `GIS-REC-${bill.invoiceNumber.replace('GIS-INV-', '')}`,
      invoiceNumber: bill.invoiceNumber,
      issuedDate: bill.paidAt || new Date(),
      status: bill.status,
      school: {
        name: 'Golden International School',
        tagline: 'The Word: Psalm 119:105 • Excellence in Primary Education & Character',
        address: 'Odo - Iro Street, Ido-Ekiti, Ekiti State, Nigeria',
        phone: '08062392750, 07069591713',
        email: 'bursar@goldeninternationalschool.edu.ng',
        registrationNo: 'GIS-EK-EDU-REG-882910',
      },
      student: {
        name: bill.studentName || 'Alex Mercer',
        studentId: 'GIPS-PUPIL-2026',
        grade: 'Primary 4 Gold (Basic 4)',
      },
      payer: {
        name: bill.payerName || req.user.name,
        email: req.user.email,
      },
      payment: {
        amount: bill.amount,
        paymentMethod: bill.paymentMethod || 'Online Gateway',
        transactionRef: bill.transactionRef || 'TXN-OFFICIAL',
        date: bill.paidAt || new Date(),
      },
      items: [
        {
          description: bill.title,
          category: bill.category,
          term: bill.term,
          amount: bill.amount,
        },
      ],
    };

    return res.json({ receipt });
  } catch (error) {
    console.error('Get receipt error:', error);
    return res.status(500).json({ error: 'Failed to retrieve receipt.' });
  }
};

module.exports = {
  getBills,
  payBill,
  getReceipt,
};
