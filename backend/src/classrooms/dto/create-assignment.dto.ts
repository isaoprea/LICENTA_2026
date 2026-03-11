export class CreateAssignmentDto {
  title: string;
  problemId: string;
  studentIds: string[]; 
  language: string;
  classroomId?: string;
}