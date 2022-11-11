// @refresh reload

import theme from "./stores/theme";

import styles from "./root.module.css";

import { Component, Suspense } from "solid-js";
import {
	Body,
	ErrorBoundary,
	FileRoutes,
	Head,
	Html,
	Link,
	Meta,
	Routes,
	Scripts,
	Title,
} from "solid-start";

const Root: Component = () => {
	return (
		<Html lang="en">
			<Head>
				<Meta charset="utf-8" />
				<Meta
					name="viewport"
					content="width=device-width,initial-scale=1"
				/>
				<Link rel="preconnect" href="https://fonts.googleapis.com" />
				<Link rel="preconnect" href="https://fonts.gstatic.com" />
				<Link rel="icon" type="image/png" href="/favicon.png" />
				<Link
					href="https://fonts.googleapis.com/css2?family=Kanit&family=Manrope&family=Mukta&display=swap"
					rel="stylesheet"
				/>
				<Title>Written Numbers</Title>
			</Head>
			<Body class={styles[`${theme()}Theme`]}>
				<Suspense>
					<ErrorBoundary>
						<Routes>
							<FileRoutes />
						</Routes>
					</ErrorBoundary>
				</Suspense>
				<Scripts />
			</Body>
		</Html>
	);
};

export default Root;
