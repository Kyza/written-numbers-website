import pomsky from "@pomsky-lang/unplugin";
import vercel from "solid-start-vercel";
import solid from "solid-start/vite";
import { UserConfigExport } from "vite";

export default {
	plugins: [
		solid({
			adapter: vercel({ edge: false }),
		}),
		pomsky.vite({
			flavor: "js",
			includeOriginal: false,
		}),
	],
	worker: {
		plugins: [
			pomsky.vite({
				flavor: "js",
				includeOriginal: false,
			}),
		],
	},
	// build: {
	// 	rollupOptions: {
	// 		plugins: [
	// 			pomsky.rollup({
	// 				flavor: "js",
	// 				includeOriginal: false,
	// 			}),
	// 		],
	// 	},
	// },
} as unknown as UserConfigExport;
