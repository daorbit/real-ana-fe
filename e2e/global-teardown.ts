import { purgeUsers } from "./support/users";

export default function globalTeardown() {
  purgeUsers();
}
