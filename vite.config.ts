import vercel from "solid-start-vercel";
import solid from "solid-start/vite";
import { UserConfigExport } from "vite";

export default {
	plugins: [
		solid({
			adapter: vercel(),
		}),
	],
} as UserConfigExport;
