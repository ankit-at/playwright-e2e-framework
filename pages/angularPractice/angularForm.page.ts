import { BasePage } from "../base.page";
import testData from "../../config/testData";

export type FormDetails = {
  name: string;
  email: string;
  password: string;
  /** option of the Gender <select> */
  gender: string;
  /** yyyy-mm-dd */
  birthday: string;
};

/**
 * AngularFormPage — the angularpractice "Form" screen. Base URL comes from
 * config/testData.
 */
export class AngularFormPage extends BasePage {
  readonly baseURL = testData.angularForm.baseURL;
  readonly nameInput = this.page.locator('input.form-control[name="name"]');
  readonly emailInput = this.page.locator('[name="email"]');
  readonly passwordInput = this.page.getByPlaceholder("Password");
  readonly loveIceCreamCheckbox = this.page.getByLabel("Check me out if you Love IceCreams!");
  readonly genderSelect = this.page.getByLabel("Gender");
  readonly employedRadio = this.page.locator('[name="inlineRadioOptions"]').first();
  readonly birthdayInput = this.page.locator('[name="bday"]');
  readonly submitButton = this.page.getByRole("button", { name: "Submit" });
  readonly successAlert = this.page.locator("div.alert-success");

  async open(): Promise<void> {
    await this.page.goto(this.baseURL);
  }

  /** Fill every field and submit. */
  async submitForm({ name, email, password, gender, birthday }: FormDetails): Promise<void> {
    await this.nameInput.fill(name);
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loveIceCreamCheckbox.click();
    await this.genderSelect.selectOption(gender);
    await this.employedRadio.click();
    await this.birthdayInput.fill(birthday);
    await this.submitButton.click();
  }
}
