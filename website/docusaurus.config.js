// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

/** @type {import('@docusaurus/types').Config} */
const config = {
	title: 'Modrunner',
	tagline: 'Search for projects on Modrinth and CurseForge & get notified of updates to tracked projects, right from Discord.',
	url: 'https://beans-squared.github.io/',
	baseUrl: '/',
	onBrokenLinks: 'throw',
	onBrokenMarkdownLinks: 'warn',
	favicon: 'img/favicon.ico',
	trailingSlash: true,

	// GitHub pages deployment config.
	// If you aren't using GitHub pages, you don't need these.
	// Usually your GitHub org/user name.
	organizationName: 'beans-squared',
	// Usually your repo name.
	projectName: 'modrunner-bot',

	// Even if you don't use internalization, you can use this field to set useful
	// metadata like html lang. For example, if your site is Chinese, you may want
	// to replace "en" with "zh-Hans".
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
					// Please change this to your repo.
					// Remove this to remove the "edit this page" links.
					editUrl:
						'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
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
								href: 'https://invite.modrunner.net/',
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
