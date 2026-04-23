import { Router } from "./router.js";
import { SearchModule } from "./search.js";
import { InventoryModule } from "./inventory.js";

document.addEventListener("DOMContentLoaded", () => {
  Router.init();
  SearchModule.init();
  InventoryModule.init();
});
