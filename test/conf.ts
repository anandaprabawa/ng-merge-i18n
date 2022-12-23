import { join } from "path";

export const RESULT_ROOT_DIR = join(__dirname, "__result__");
export const WORKSPACE_DIR = RESULT_ROOT_DIR;
export const CURRENT_DIR = RESULT_ROOT_DIR;

export const INITIAL_MESSAGES_JSON = {
  welcome: "Welcome",
  title: "Title",
  "page.login.title": "Login",
  "page.login.description": "Please login",
};
