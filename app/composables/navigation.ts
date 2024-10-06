export function useNavigationMenu() {
  const separator = h('hr')
  const auth = useAuthStore()
  const menu = computed(() => {

    return [
      {
        title: 'Дашборд',
        icon: 'pi pi-fw pi-home',
        href: '/',
      },
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
        title: 'Продукты',
        icon: 'pi pi-fw pi-box',
        href: '/products',
      },
      {
        title: 'Склад',
        icon: 'pi pi-fw pi-warehouse',
        href: '/warehouse',
      },
      {
        title: 'Пользователи',
        icon: 'pi pi-fw pi-user',
        href: '/users',
        hidden: !auth.user?.roles.includes('ADMIN'),
      },
      {
        title: 'Выйти',
        icon: 'pi pi-fw pi-sign-out',
        hidden: !auth.user,

      },
    ]

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
