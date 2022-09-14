// @ts-check
const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

/** @type {import('@docusaurus/types').Config} */
const config = {
	title: 'Modrunner',
	tagline:
		'Search for projects on Modrinth and CurseForge & get notified of updates to tracked projects, right from Discord',
	url: 'https://beans-squared.github.io/',
	baseUrl: '/',
	onBrokenLinks: 'throw',
	onBrokenMarkdownLinks: 'warn',
	favicon: 'img/favicon.ico',
	trailingSlash: true,
	organizationName: 'beans-squared',
	projectName: 'modrunner-bot',

	i18n: {
		defaultLocale: 'en',
		locales: ['en'],
	},

	presets: [
		[
			'classic',
			/** @type {import('@docusaurus/preset-classic').Options} */
			({
				docs: {
					sidebarPath: require.resolve('./sidebars.js'),
				},
				blog: {
					showReadingTime: true,
				},
				theme: {
					customCss: require.resolve('./src/css/custom.css'),
				},
			}),
		],
	],

	themeConfig:
		/** @type {import('@docusaurus/preset-classic').ThemeConfig} */
		({
			metadata: [
				{
					name: 'keywords',
					content: 'discord, bots, blog, docs, wiki',
				},
			],
			navbar: {
				title: 'Modrunner',
				logo: {
					alt: 'My Site Logo',
					src: 'img/modrunner_logo.svg',
				},
				items: [
					{
						type: 'doc',
						docId: 'intro',
						position: 'left',
						label: 'Docs',
					},
					{ to: '/blog', label: 'Blog', position: 'left' },
					{
						href: 'https://github.com/beans-squared/modrunner-bot',
						label: 'GitHub',
						position: 'right',
					},
				],
			},
			footer: {
				style: 'dark',
				links: [
					{
						title: 'Resources',
						items: [
							{
								label: 'Documentation',
								to: '/docs/intro',
							},
							{
								label: 'Invite Link',
								href: 'https://discord.com/api/oauth2/authorize?client_id=978413985722404924&permissions=2048&scope=bot%20applications.commands',
							},
						],
					},
					{
						title: 'Community',
						items: [
							{
								label: 'Blog',
								to: '/blog',
							},
							{
								label: 'Discord',
								href: 'https://discord.gg/fm88jhzEbt',
							},
						],
					},
					{
						title: 'More',
						items: [
							{
								label: 'Terms of Service',
								to: '/legal/tos',
							},
							{
								label: 'Privacy Policy',
								to: '/legal/privacy_policy',
							},
							{
								label: 'GitHub',
								href: 'https://github.com/beans-squared/modrunner-bot',
							},
						],
					},
				],
				copyright: `Copyright © ${new Date().getFullYear()} Modrunner. Built with Docusaurus.`,
			},
			prism: {
				theme: lightCodeTheme,
				darkTheme: darkCodeTheme,
			},
		}),
};

module.exports = config;
