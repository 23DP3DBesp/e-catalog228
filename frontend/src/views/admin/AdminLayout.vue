<template>
	<main class="auth-shell">
		<section class="auth-card">
			<header class="auth-header">
				<RouterLink class="brand" to="/" aria-label="E-Catalog home">
					<span class="brand-mark" aria-hidden="true"></span>
					<span>E-Catalog</span>
				</RouterLink>
				<div class="header-actions">
					<RouterLink class="header-link" to="/catalog">Catalog</RouterLink>
					<AuthNav />
				</div>
			</header>

			<nav class="admin-tabs" aria-label="Admin sections">
				<RouterLink to="/admin">Products</RouterLink>
				<RouterLink to="/admin/users">Users</RouterLink>
				<RouterLink to="/admin/orders">Orders</RouterLink>
			</nav>

			<div class="admin-page">
				<RouterView />
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

<script setup>
import '../../assets/admin.css'
import AuthNav from '../../components/AuthNav.vue'
</script>

<style scoped>

.auth-shell { min-height: 100vh; padding: 20px; background: #24211f; }
.auth-card { display: flex; flex-direction: column; min-height: calc(100vh - 40px); border-radius: 64px; background: #fff; box-shadow: 0 18px 55px rgb(0 0 0 / 18%); overflow: hidden; }
.auth-header { display: flex; align-items: center; justify-content: space-between; padding: 22px 5%; border-bottom: 1px solid #ededed; }
.brand { display: inline-flex; align-items: center; gap: 9px; color: #19232b; font-size: 22px; font-weight: 700; letter-spacing: -1.1px; text-decoration: none; }
.brand-mark { width: 24px; height: 24px; border: 3px solid transparent; border-radius: 50%; background: linear-gradient(#fff, #fff) padding-box, conic-gradient(#ff4b13, #ffd400, #00a9e8, #a13bdb, #ff4b13) border-box; }
.header-actions { display: flex; align-items: center; gap: 24px; }
.header-link { color: #4e555a; font-size: 14px; text-decoration: none; }
.header-link:hover { color: #111820; }
.auth-footer { display: flex; align-items: center; justify-content: space-between; padding: 22px 5%; border-top: 1px solid #ededed; color: #858585; font-size: 13px; }
.auth-footer nav { display: flex; align-items: center; gap: 20px; }
.auth-footer a { color: #4e555a; text-decoration: none; }
.auth-footer button { border: 0; background: transparent; color: #4e555a; font-size: 13px; cursor: pointer; }


.admin-tabs { display: flex; gap: 8px; width: min(100% - 40px, 1180px); margin: 28px auto 0; }
.admin-tabs a { padding: 10px 20px; border: 1px solid #dedede; border-radius: 22px; color: #4e555a; font-size: 14px; text-decoration: none; transition: background .2s ease, color .2s ease; }
.admin-tabs a:hover { border-color: #19232b; }
.admin-tabs a.router-link-exact-active { border-color: #161b20; background: #161b20; color: #fff; }

@media (max-width: 800px) {
	.auth-shell { padding: 0; }
	.auth-card { min-height: 100vh; border-radius: 0; }
	.auth-header, .auth-footer { padding-left: 20px; padding-right: 20px; }
	.admin-tabs { overflow-x: auto; }
}
</style>