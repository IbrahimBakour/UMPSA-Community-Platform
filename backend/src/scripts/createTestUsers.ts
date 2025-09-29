import { Workbook } from "exceljs";

async function createSampleUsersFile() {
  const workbook = new Workbook();
  const worksheet = workbook.addWorksheet("Users");

  // Add headers
  worksheet.columns = [
    { header: "studentId", key: "studentId", width: 15 },
    { header: "password", key: "password", width: 15 },
  ];

  // Add test users
  worksheet.addRows([
    { studentId: "CB20001", password: "test123" },
    { studentId: "CB20002", password: "test123" },
    { studentId: "admin001", password: "admin123" },
  ]);

  // Save the file
  await workbook.xlsx.writeFile("test-users.xlsx");
}

createSampleUsersFile()
  .then(() => console.log("Sample users file created successfully!"))
  .catch(console.error);
