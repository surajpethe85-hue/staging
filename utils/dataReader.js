


import fs from "fs";

// {
//   "status": "success",
//   "data": {
//     "id": 1,
//     "employee_name": "Tiger Nixon",
//     "employee_salary": 320800,
//     "employee_age": 61,
//     "profile_image": ""
//   },
//   "message": "Successfully! Record has been fetched."
// }

                    ../test-data/user.JSON
export function readJson(filePath) {


    return JSON.parse(fs.readFileSync(filePath, "utf-8"));


}
