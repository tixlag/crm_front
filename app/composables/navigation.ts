export function useNavigationMenu() {
  const separator = h('hr')
  const auth = useAuthStore()
  const menu = computed(() => {
    if (auth.user?.roles.includes('ADMIN')) {
      return [
        {
          title: 'Покупатели',
          icon: 'pi pi-fw pi-users',
          href: '/buyers',
        },
        {
          title: 'Заказы',
          icon: 'pi pi-fw pi-shopping-cart',
          href: '/orders',
        },
        {
          title: 'Напоминания',
          icon: 'pi pi-fw pi-bell',
          href: '/orders/remind',
        },
        {
          title: 'Продукты',
          icon: 'pi pi-fw pi-barcode',
          href: '/products',
        },
        {
          title: 'Склад',
          icon: 'pi pi-fw pi-warehouse',
          href: '/warehouse',
        },
        {
          title: 'Статистика',
          icon: 'pi pi-chart-bar',
          href: '/statistics',
        },
        {
          title: 'Настройки',
          icon: 'pi pi-cog pi-fw',
          href: '/settings',
          hidden: !auth.user?.roles.includes('ADMIN'),
        },
        {
          title: 'Google Contacts',
          icon: 'pi pi-google',
          href: '/google',
        },
        {
          title: 'Выйти',
          icon: 'pi pi-fw pi-sign-out',
          hidden: !auth.user,
        },
      ]
    }
    else if (auth.user?.roles.includes('DELIVERYMAN')) {
      return [
        {
          title: 'Заказы',
          icon: 'pi pi-fw pi-shopping-cart',
          href: '/orders/delivery',
        },
        {
          title: 'Выйти',
          icon: 'pi pi-fw pi-sign-out',
          hidden: !auth.user,

        },
      ]
    }
    else if (auth.user?.roles.includes('MANAGER')) {
      return [
        {
          title: 'Покупатели',
          icon: 'pi pi-fw pi-users',
          href: '/buyers',
        },
        {
          title: 'Заказы',
          icon: 'pi pi-fw pi-shopping-cart',
          href: '/orders',
        },
        {
          title: 'Напоминания',
          icon: 'pi pi-fw pi-bell',
          href: '/orders/remind',
        },
        {
          title: 'Продукты',
          icon: 'pi pi-fw pi-barcode',
          href: '/products',
        },
        {
          title: 'Склад',
          icon: 'pi pi-fw pi-warehouse',
          href: '/warehouse',
        },
        {
          title: 'Статистика',
          icon: 'pi pi-chart-bar',
          href: '/statistics',
          hidden: !auth.user?.settings?.canSeeHistory_statistic,
        },
        {
          title: 'Google Contacts',
          icon: 'pi pi-google',
          href: '/google',
        },
        {
          title: 'Выйти',
          icon: 'pi pi-fw pi-sign-out',
          hidden: !auth.user,

        },
      ]
    }
    return []


    // return [
    //   {
    //     href: '/',
    //     title: 'Домой',
    //     icon: 'pi pi-fw pi-home',
    //   },
    //   {
    //     component: markRaw(separator),
    //   },
    //   {
    //     title: 'PrimeVue',
    //     icon: 'pi pi-prime',
    //     child: [
    //       { href: '/prime/datatable', title: 'DataTable' },
    //       { href: '/prime/messages', title: 'Messages' },
    //       { href: '/prime/Validation', title: 'Validation' },
    //     ],
    //   },
    //   {
    //     title: 'UI',
    //     icon: 'pi pi-image',
    //     child: [
    //       { href: '/ui/uno', title: 'UnoCSS' },
    //       { href: '/ui/icons', title: 'Icons' },
    //       { href: '/ui/tiptap', title: 'TipTap' },
    //     ],
    //   },
    //   {
    //     title: 'Данные',
    //     icon: 'pi pi-server',
    //     child: [
    //       { href: '/data/stores', title: 'Сторы' },
    //       { href: '/data/i18n', title: 'Локализация' },
    //       { href: '/data/server', title: 'Сервер' },
    //     ],
    //   },
    //   {
    //     title: 'Контент',
    //     icon: 'pi pi-book',
    //     child: [
    //       { href: '/cms/markdown', title: 'Markdown' },
    //       { href: '/cms/component', title: 'Компоненты' },
    //     ],
    //   },
    //
    // ]
  })

  return { menu }
}
