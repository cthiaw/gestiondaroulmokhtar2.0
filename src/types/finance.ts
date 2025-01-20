export interface Payment {
  id: string;
  student_id: string;
  amount: number;
  payment_date: string;
  payment_type: string;
  status: string;
  student?: {
    first_name: string;
    last_name: string;
    matricule: string;
  };
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  expense_date: string;
  expense_type: string;
  staff_id?: string;
  staff?: {
    first_name: string;
    last_name: string;
    matricule: string;
  };
}