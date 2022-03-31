export default function (sequelize, DataTypes) {
  const poolNote = sequelize.define(
    'poolNote',
    {
      id: {
        type: DataTypes.STRING,
        defaultValue: 'default',
        primaryKey: true,
      },
      poolId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING(1024),
        allowNull: false,
        validate: {
          len: [0, 2083],
        },
      },
      description: {
        type: DataTypes.STRING(2083),
        allowNull: false,
        validate: {
          len: [0, 2083],
        },
      },
    },
    {
      timestamps: true,
      paranoid: true,
    },
  );

  poolNote.associate = (models) => {
    models.poolNote.belongsTo(models.tenant, {
      as: 'tenant',
      foreignKey: {
        allowNull: false,
      },
    });
  };

  return poolNote;
}
