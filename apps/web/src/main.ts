import { bootstrapApp } from './bootstrap';

bootstrapApp().catch((error: unknown) => {
  console.error(error);
});
