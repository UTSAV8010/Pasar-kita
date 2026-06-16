const ensureMonthlyRevenueMenu = () => {
	const sidebarMenu = document.querySelector('#sidebar .side-menu.top');
	if (!sidebarMenu) return;

	const existing = sidebarMenu.querySelector('a[href*="monthly-revenue.php"]');
	const isMonthlyPage = window.location.pathname.toLowerCase().includes('monthly-revenue.php');

	if (!existing) {
		const li = document.createElement('li');
		li.innerHTML = `<a href="monthly-revenue.php"><i class='bx bx-line-chart'></i><span class="text">Monthly Revenue</span></a>`;
		const insertAfter = sidebarMenu.querySelector('a[href*="manage-delivery-payment.php"]')
			|| sidebarMenu.querySelector('a[href*="manage-online-order.php"]');
		if (insertAfter && insertAfter.parentElement) {
			insertAfter.parentElement.insertAdjacentElement('afterend', li);
		} else {
			sidebarMenu.appendChild(li);
		}
	}

	const link = sidebarMenu.querySelector('a[href*="monthly-revenue.php"]');
	if (link && isMonthlyPage) {
		const li = link.closest('li');
		if (li) {
			sidebarMenu.querySelectorAll('li').forEach((node) => node.classList.remove('active'));
			li.classList.add('active');
		}
	}
};

ensureMonthlyRevenueMenu();

const allSideMenu = document.querySelectorAll('#sidebar .side-menu.top li a');

allSideMenu.forEach(item=> {
	const li = item.parentElement;

	item.addEventListener('click', function () {
		allSideMenu.forEach(i=> {
			i.parentElement.classList.remove('active');
		})
		li.classList.add('active');
	})
});




// TOGGLE SIDEBAR
const menuBar = document.querySelector('#content nav .bx.bx-menu');
const sidebar = document.getElementById('sidebar');
const canCollapseSidebar = () => window.innerWidth > 1200;

if (menuBar && sidebar) {
	menuBar.addEventListener('click', function () {
		if (canCollapseSidebar()) {
			sidebar.classList.toggle('hide');
		} else {
			sidebar.classList.add('hide');
		}
	});
}







const searchButton = document.querySelector('#content nav form .form-input button');
const searchButtonIcon = document.querySelector('#content nav form .form-input button .bx');
const searchForm = document.querySelector('#content nav form');

if (searchButton && searchButtonIcon && searchForm) {
	searchButton.addEventListener('click', function (e) {
		if(window.innerWidth < 576) {
			e.preventDefault();
			searchForm.classList.toggle('show');
			if(searchForm.classList.contains('show')) {
				searchButtonIcon.classList.replace('bx-search', 'bx-x');
			} else {
				searchButtonIcon.classList.replace('bx-x', 'bx-search');
			}
		}
	});
}





const syncSidebarForViewport = () => {
	if (!sidebar) return;
	if (window.innerWidth <= 1200) {
		sidebar.classList.add('hide');
	} else {
		sidebar.classList.remove('hide');
	}
};

syncSidebarForViewport();

if (searchButtonIcon && searchForm && window.innerWidth > 576) {
	searchButtonIcon.classList.replace('bx-x', 'bx-search');
	searchForm.classList.remove('show');
}


window.addEventListener('resize', function () {
	if(searchButtonIcon && searchForm && this.innerWidth > 576) {
		searchButtonIcon.classList.replace('bx-x', 'bx-search');
		searchForm.classList.remove('show');
	}
	syncSidebarForViewport();
})


const THEME_STORAGE_KEY = 'admin-theme';
const switchMode = document.getElementById('switch-mode');
const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
const shouldUseDark = savedTheme === 'dark';

document.body.classList.toggle('dark', shouldUseDark);

if (switchMode) {
	switchMode.checked = shouldUseDark;
	switchMode.addEventListener('change', function () {
		const isDark = this.checked;
		document.body.classList.toggle('dark', isDark);
		localStorage.setItem(THEME_STORAGE_KEY, isDark ? 'dark' : 'light');
		window.dispatchEvent(new CustomEvent('admin-theme-change', {
			detail: { theme: isDark ? 'dark' : 'light' }
		}));
	});
}

/* Table JS Start */

if (/(iPhone|iPad|iPod)/gi.test(navigator.userAgent) && window.location.pathname.indexOf('/full') > -1) {
  var p = document.createElement('p');
  p.innerHTML = '<a target="_blank" href="https://s.codepen.io/dbushell/debug/wGaamR"><b>Click here to view this demo properly on iOS devices (remove the top frame)</b></a>';
  document.body.insertBefore(p, document.body.querySelector('h1'));
}


/* Table JS End */

/* Global reveal animations */
const revealTargets = document.querySelectorAll(
	'#content main .head-title, #content main .table-data > div, #content main .table-data-message > div, #content main .box-info li, #content main .dashboard-grid .kpi-card, #content main .dashboard-charts .chart-panel'
);

if (revealTargets.length) {
	revealTargets.forEach((node) => node.classList.add('reveal-up'));

	const revealObserver = new IntersectionObserver((entries, observer) => {
		entries.forEach((entry) => {
			if (entry.isIntersecting) {
				entry.target.classList.add('is-visible');
				observer.unobserve(entry.target);
			}
		});
	}, {
		threshold: 0.12,
		rootMargin: '0px 0px -30px 0px'
	});

	revealTargets.forEach((node) => revealObserver.observe(node));
}

/* Notification */

function menuToggle(){
	const toggleMenu = document.querySelector('.notif_menu');
	toggleMenu.classList.toggle('active')
}

/*Notification*/

/*** Inbox ***/



/*** Inbox ***/

/* Shared AJAX pagination for admin tables */
(function () {
	const PAGE_SIZE = 10;

	const initMapsInScope = (scope) => {
		if (typeof L === 'undefined') return;

		const maps = scope.querySelectorAll('[id^="map-"]');
		maps.forEach((mapEl) => {
			if (mapEl.dataset.mapLoaded === '1') return;
			const mapId = mapEl.id;
			const lat = parseFloat(mapEl.dataset.lat || '');
			const lng = parseFloat(mapEl.dataset.lng || '');
			if (Number.isNaN(lat) || Number.isNaN(lng)) return;

			const map = L.map(mapId).setView([lat, lng], 13);
			L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
				maxZoom: 19,
				attribution: '&copy; OpenStreetMap'
			}).addTo(map);
			L.marker([lat, lng]).addTo(map).bindPopup(`Latitude: ${lat}, Longitude: ${lng}`);
			mapEl.dataset.mapLoaded = '1';
		});
	};

	const buildPagerHtml = (currentPage, totalPages) => {
		let html = `<button type="button" class="page-btn" data-page="${Math.max(1, currentPage - 1)}" ${currentPage === 1 ? 'disabled' : ''}>Prev</button>`;
		const startPage = Math.max(1, currentPage - 2);
		const endPage = Math.min(totalPages, startPage + 4);

		for (let i = startPage; i <= endPage; i += 1) {
			html += `<button type="button" class="page-btn ${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
		}

		html += `<button type="button" class="page-btn" data-page="${Math.min(totalPages, currentPage + 1)}" ${currentPage === totalPages ? 'disabled' : ''}>Next</button>`;
		return html;
	};

	/* Server AJAX mode (online orders page) */
	const serverPager = document.getElementById('orders-pagination');
	const serverTbody = document.getElementById('orders-table-body');

	if (serverPager && serverTbody) {
		let currentPage = Number(serverPager.dataset.currentPage || 1);
		let totalPages = Number(serverPager.dataset.totalPages || 1);

		const renderServerPager = () => {
			if (totalPages <= 1) {
				serverPager.innerHTML = '';
				return;
			}
			serverPager.innerHTML = buildPagerHtml(currentPage, totalPages);
		};

		const fetchServerPage = async (page) => {
			const pageNumber = Number(page);
			if (!pageNumber || pageNumber < 1 || pageNumber > totalPages) return;

			const url = new URL(window.location.href);
			url.searchParams.set('ajax', '1');
			url.searchParams.set('page', String(pageNumber));

			try {
				const response = await fetch(url.toString(), {
					method: 'GET',
					headers: { 'X-Requested-With': 'XMLHttpRequest' }
				});
				if (!response.ok) return;

				const payload = await response.json();
				if (!payload || typeof payload.rows_html !== 'string') return;

				serverTbody.innerHTML = payload.rows_html;
				currentPage = Number(payload.current_page || pageNumber);
				totalPages = Number(payload.total_pages || totalPages);
				serverPager.dataset.currentPage = String(currentPage);
				serverPager.dataset.totalPages = String(totalPages);
				renderServerPager();
				initMapsInScope(serverTbody);
			} catch (error) {
				console.error('Server pagination error:', error);
			}
		};

		serverPager.addEventListener('click', (event) => {
			const button = event.target.closest('.page-btn');
			if (!button || button.disabled) return;
			const targetPage = Number(button.dataset.page || 1);
			if (targetPage === currentPage) return;
			fetchServerPage(targetPage);
		});

		renderServerPager();
		initMapsInScope(document);
	}

	/* Client no-reload mode (all other admin tables) */
	const topTables = Array.from(document.querySelectorAll('#content main .table-data table, #content main .table-data-message table'))
		.filter((table) => !table.closest('td') && table.id !== 'orders-table');

	topTables.forEach((table, index) => {
		const tbody = table.tBodies[0];
		if (!tbody) return;

		const allRows = Array.from(tbody.rows);
		const totalPages = Math.ceil(allRows.length / PAGE_SIZE);
		if (totalPages <= 1) return;

		let currentPage = 1;
		let pager = table.parentElement.querySelector('.table-pagination');
		if (!pager) {
			pager = document.createElement('div');
			pager.className = 'table-pagination ajax-pagination';
			table.insertAdjacentElement('afterend', pager);
		}
		pager.dataset.tableIndex = String(index);

		const renderRows = () => {
			const start = (currentPage - 1) * PAGE_SIZE;
			const end = start + PAGE_SIZE;
			allRows.forEach((row, rowIndex) => {
				row.style.display = rowIndex >= start && rowIndex < end ? '' : 'none';
			});
		};

		const renderPager = () => {
			pager.innerHTML = buildPagerHtml(currentPage, totalPages);
		};

		pager.addEventListener('click', (event) => {
			const button = event.target.closest('.page-btn');
			if (!button || button.disabled) return;
			const targetPage = Number(button.dataset.page || 1);
			if (!targetPage || targetPage === currentPage) return;
			currentPage = Math.max(1, Math.min(totalPages, targetPage));
			renderRows();
			renderPager();
		});

		renderRows();
		renderPager();
	});
})();

/* Password visibility toggle */
(function () {
	const iconMarkup = `
		<svg class="eye-open" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
			<path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6z"></path>
			<circle cx="12" cy="12" r="3.2"></circle>
		</svg>
		<svg class="eye-closed" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
			<path d="M3 5l18 14"></path>
			<path d="M10.7 10.8a3 3 0 004.2 4.2"></path>
			<path d="M6.2 7.4C4 9.1 2.5 12 2.5 12s3.5 6 9.5 6c2.1 0 3.9-.6 5.4-1.6"></path>
			<path d="M13.3 6.2A9.6 9.6 0 0012 6c-2.1 0-3.9.6-5.5 1.6"></path>
		</svg>
	`;

	const init = () => {
		document.querySelectorAll('input[type="password"]').forEach((input) => {
			if (input.closest('.password-field')) return;

			const wrapper = document.createElement('div');
			wrapper.className = 'password-field';
			input.parentNode.insertBefore(wrapper, input);
			wrapper.appendChild(input);

			const toggle = document.createElement('button');
			toggle.type = 'button';
			toggle.className = 'password-toggle';
			toggle.setAttribute('aria-label', 'Show password');
			toggle.setAttribute('aria-pressed', 'false');
			toggle.innerHTML = iconMarkup;
			wrapper.appendChild(toggle);

			const syncState = () => {
				const isVisible = input.type === 'text';
				toggle.classList.toggle('is-visible', isVisible);
				toggle.setAttribute('aria-label', isVisible ? 'Hide password' : 'Show password');
				toggle.setAttribute('aria-pressed', isVisible ? 'true' : 'false');
			};

			toggle.addEventListener('click', () => {
				input.type = input.type === 'password' ? 'text' : 'password';
				syncState();
				input.focus({ preventScroll: true });
			});

			syncState();
		});
	};

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', init);
	} else {
		init();
	}
})();

/* Custom horizontal scrollbar indicators for tables (tablet/mobile) */
(function () {
	const targets = document.querySelectorAll(
		'#content main .table-data .order, #content main .table-data-message .order, .orders-table-wrap'
	);
	if (!targets.length) return;

	const wrappers = [];

	const wrapTarget = (el) => {
		const parent = el.parentElement;
		if (parent && parent.classList.contains('scroll-wrapper')) return parent;

		const wrapper = document.createElement('div');
		wrapper.className = 'scroll-wrapper';
		parent.insertBefore(wrapper, el);
		wrapper.appendChild(el);

		const indicator = document.createElement('div');
		indicator.className = 'scrollbar-indicator';
		const thumb = document.createElement('span');
		thumb.className = 'scrollbar-thumb';
		indicator.appendChild(thumb);
		wrapper.appendChild(indicator);
		return wrapper;
	};

	const updateIndicator = (wrapper, el) => {
		const indicator = wrapper.querySelector('.scrollbar-indicator');
		const thumb = wrapper.querySelector('.scrollbar-thumb');
		if (!indicator || !thumb) return;

		const scrollWidth = el.scrollWidth;
		const clientWidth = el.clientWidth;
		if (scrollWidth <= clientWidth + 1) {
			wrapper.classList.remove('is-scrollable');
			return;
		}

		wrapper.classList.add('is-scrollable');
		const indicatorWidth = indicator.clientWidth || clientWidth;
		const ratio = clientWidth / scrollWidth;
		const thumbWidth = Math.max(36, Math.floor(indicatorWidth * ratio));
		const maxOffset = Math.max(0, indicatorWidth - thumbWidth);
		const maxScroll = Math.max(1, scrollWidth - clientWidth);
		const offset = Math.round((el.scrollLeft / maxScroll) * maxOffset);
		thumb.style.width = `${thumbWidth}px`;
		thumb.style.transform = `translateX(${offset}px)`;
	};

	targets.forEach((el) => {
		const wrapper = wrapTarget(el);
		wrappers.push({ wrapper, el });

		const onScroll = () => {
			window.requestAnimationFrame(() => updateIndicator(wrapper, el));
		};
		el.addEventListener('scroll', onScroll, { passive: true });

		if (typeof ResizeObserver !== 'undefined') {
			const ro = new ResizeObserver(() => updateIndicator(wrapper, el));
			ro.observe(el);
		}

		updateIndicator(wrapper, el);
	});

	window.addEventListener('resize', () => {
		wrappers.forEach(({ wrapper, el }) => updateIndicator(wrapper, el));
	});
})();
