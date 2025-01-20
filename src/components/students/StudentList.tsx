import { formatDisplayDate } from '../../utils/dateValidation';

// Update the date display in the table row
<td className="px-6 py-4 whitespace-nowrap">
  {student.birth_date ? formatDisplayDate(student.birth_date) : '-'}
</td>