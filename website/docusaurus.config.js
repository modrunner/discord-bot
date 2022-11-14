// @ts-check
const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

/** @type {import('@docusaurus/types').Config} */
const config = {
	title: 'Modrunner',
	tagline:
		'Search & track Minecraft projects in Discord',
	url: 'https://smcmo.github.io/',
	baseUrl: '/',
	onBrokenLinks: 'throw',
	onBrokenMarkdownLinks: 'warn',
	favicon: 'img/logo.ico',
	trailingSlash: true,
	organizationName: 'smcmo',
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
					alt: 'The Modrunner logo',
					src: 'img/logo_trans.png',
				},
				items: [
					{
						type: 'doc',
						docId: 'intro',
						position: 'left',
						label: 'Documentation',
					},
					{
						href: 'https://github.com/smcmo/modrunner-bot',
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
								href: 'https://github.com/smcmo/modrunner-bot',
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
