<template>
	<main class="auth-shell">
		<section class="auth-card" aria-labelledby="login-title">
			<header class="auth-header">
				<RouterLink class="brand" to="/login" aria-label="E-Catalog home">
					<span class="brand-mark" aria-hidden="true"></span>
					<span>E-Catalog</span>
				</RouterLink>
				<RouterLink class="header-link" to="/register">Sign Up</RouterLink>
			</header>

			<div class="auth-content">
				<h1 id="login-title">Sign In</h1>

				<form class="auth-form" @submit.prevent>
					<label>
						<span class="visually-hidden">Email or Username</span>
						<input type="text" name="email" placeholder="Email or Username" autocomplete="username" />
					</label>

					<label class="password-field">
						<span class="visually-hidden">Password</span>
						<input type="password" name="password" placeholder="Password" autocomplete="current-password" />
						<span class="password-icon" aria-hidden="true">&#9673;</span>
					</label>

					<RouterLink class="forgot-link" to="/login">Forgot password?</RouterLink>
					<button type="submit">Sign In</button>
				</form>
			</div>

			<footer class="auth-footer">
				<span>&copy; 2026 E-Catalog</span>
				<nav aria-label="Footer navigation">
					<a href="mailto:contact@example.com">Contact Us</a>
					<button type="button">English <span aria-hidden="true">⌄</span></button>
				</nav>
			</footer>
		</section>
	</main>
</template>