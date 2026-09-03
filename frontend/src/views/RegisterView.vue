<template>
	<main class="auth-shell">
		<section class="auth-card" aria-labelledby="register-title">
			<header class="auth-header">
				<RouterLink class="brand" to="/login" aria-label="E-Catalog home">
					<span class="brand-mark" aria-hidden="true"></span>
					<span>E-Catalog</span>
				</RouterLink>
				<RouterLink class="header-link" to="/login">Sign In</RouterLink>
			</header>

			<div class="auth-content">
				<h1 id="register-title">Create Account</h1>

				<form class="auth-form" @submit.prevent>
					<label>
						<span class="visually-hidden">Name</span>
						<input type="text" name="name" placeholder="Name" autocomplete="name" />
					</label>

					<label>
						<span class="visually-hidden">Email</span>
						<input type="email" name="email" placeholder="Email" autocomplete="email" />
					</label>

					<label class="password-field">
						<span class="visually-hidden">Password</span>
						<input type="password" name="password" placeholder="Password" autocomplete="new-password" />
						<span class="password-icon" aria-hidden="true">&#9673;</span>
					</label>

					<button type="submit">Create Account</button>
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