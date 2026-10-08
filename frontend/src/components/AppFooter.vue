<template>
	<footer class="app-footer">
		<span>&copy; {{ year }} E-Catalog</span>
		<nav aria-label="Footer navigation">
			<a href="mailto:contact@example.com">Contact Us</a>
			<button type="button">English <span aria-hidden="true">⌄</span></button>
		</nav>
	</footer>
</template>

<script setup>
const year = new Date().getFullYear()
</script>

<style scoped>
.app-footer { display: flex; align-items: center; justify-content: space-between; margin-top: auto; padding: 22px 5%; border-top: 1px solid #ededed; color: #858585; font-size: 13px; }
.app-footer nav { display: flex; align-items: center; gap: 20px; }
.app-footer a { color: #4e555a; text-decoration: none; }
.app-footer a:hover { color: #ef552c; }
.app-footer button { border: 0; background: transparent; color: #4e555a; font-size: 13px; cursor: pointer; }

@media (max-width: 800px) {
	.app-footer { padding-left: 20px; padding-right: 20px; }
}
</style>