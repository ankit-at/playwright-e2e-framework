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
    await this.actions.goto(this.baseURL);
  }

  /** Fill every field and submit. */
  async submitForm({ name, email, password, gender, birthday }: FormDetails): Promise<void> {
    await this.actions.fill(this.nameInput, name);
    await this.actions.fill(this.emailInput, email);
    await this.actions.fill(this.passwordInput, password);
    await this.actions.click(this.loveIceCreamCheckbox);
    await this.actions.selectOption(this.genderSelect, gender);
    await this.actions.click(this.employedRadio);
    await this.actions.fill(this.birthdayInput, birthday);
    await this.actions.click(this.submitButton);
  }
}
