import { Guild } from 'discord.js';
import type { Sequelize } from 'sequelize';

(sequelize: Sequelize, DataTypes: any) => {
  const Guild = sequelize.define(
    'guild',
    {
      id: {
        type: DataTypes.STRING,
        primaryKey: true,
      },
      changelogMaxLength: {
        type: DataTypes.INTEGER,
        defaultValue: 4000,
      },
      maxTrackedProjects: {
        type: DataTypes.INTEGER,
        defaultValue: 100,
      },
      notificationStyle: {
        type: DataTypes.STRING,
        defaultValue: 'normal',
        validate: {
          isIn: [['normal', 'compact']],
        },
      },
    },
    {
      timestamps: false,
    }
  );

  Reflect.defineProperty(Guild.prototype, 'setChangelogMaxLength', {
    value: async function (length: number): Promise<void> {
      this.changelogMaxLength = length;
      await this.save();
    },
  });

  Reflect.defineProperty(Guild.prototype, 'setMaxTrackedProjects', {
    value: async function (max: number): Promise<void> {
      this.maxTrackedProjects = max;
      await this.save();
    },
  });

  Reflect.defineProperty(Guild.prototype, 'setNotificationStyle', {
    value: async function (style: string): Promise<void> {
      this.notificationStyle = style;
      await this.save();
    },
  });

  return Guild;
};

export default Guild;
