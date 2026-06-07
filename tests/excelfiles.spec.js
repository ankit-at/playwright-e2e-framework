const ExcelJs = require("exceljs");
const { test, expect } = require("../fixtures/practice.fixtures");

/**
 * Find `searchText` in Sheet1 and overwrite the cell `change.colChange` columns
 * to its right with `replaceText`.
 * @param {string} searchText
 * @param {string} replaceText
 * @param {{ rowChange: number, colChange: number }} change
 * @param {string} filePath
 */
async function writeExcelTest(searchText, replaceText, change, filePath) {
  const workbook = new ExcelJs.Workbook();
  await workbook.xlsx.readFile(filePath);
  const worksheet = workbook.getWorksheet("Sheet1");
  if (!worksheet) throw new Error("Worksheet 'Sheet1' not found");

  const output = readExcel(worksheet, searchText); // not async
  const cell = worksheet.getCell(output.row, output.column + change.colChange);
  cell.value = replaceText;
  await workbook.xlsx.writeFile(filePath);
}

/**
 * Locate the cell holding `searchText`. Does no async work, so it is not async.
 * @param {import("exceljs").Worksheet} worksheet
 * @param {string} searchText
 * @returns {{ row: number, column: number }}
 */
function readExcel(worksheet, searchText) {
  let output = { row: -1, column: -1 };
  worksheet.eachRow((row, rowNumber) => {
    row.eachCell((cell, colNumber) => {
      if (cell.value === searchText) {
        output = { row: rowNumber, column: colNumber };
      }
    });
  });
  return output;
}

test("Upload download excel validation", async ({ uploadDownloadPage }, testInfo) => {
  const textSearch = "Mango";
  const updateValue = "350";

  await uploadDownloadPage.open();

  // Capture the download, edit it in a CI-safe writable location, then re-upload.
  const download = await uploadDownloadPage.download();
  const filePath = testInfo.outputPath("download.xlsx");
  await download.saveAs(filePath);

  await writeExcelTest(textSearch, updateValue, { rowChange: 0, colChange: 2 }, filePath);

  await uploadDownloadPage.upload(filePath);

  const desiredRow = uploadDownloadPage.rowContaining(textSearch);
  await expect(desiredRow.getByText(updateValue)).toBeVisible();
});
