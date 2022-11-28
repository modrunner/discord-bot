import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.css';

const FeatureList = [
  {
    title: 'Search for Projects',
    Svg: require('@site/static/img/undraw_web_search_re_efla.svg').default,
    description: (
      <>
        Search for your favorite Minecraft community projects, including mods, modpacks, and resource packs, and get information posted directly into Discord
        for easy sharing.
      </>
    ),
  },
  {
    title: 'Watch for Project Updates',
    Svg: require('@site/static/img/undraw_notify_re_65on.svg').default,
    description: (
      <>
        Get customizable notifications posted into Discord when your tracked projects recieve updates. Know exactly when new features are added to your favorite
        mods, modpacks and more.
      </>
    ),
  },
  {
    title: 'Hassle-Free Announcements',
    Svg: require('@site/static/img/undraw_posts_re_ormv.svg').default,
    description: (
      <>
        For project developers, Modrunner takes the hassle out of having to write your own announcements every time you update your projects: Modrunner can let
        everyone know for you.
      </>
    ),
  },
];

function Feature({ Svg, title, description }) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
