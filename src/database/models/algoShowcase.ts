export default function (sequelize, DataTypes) {
  const algoShowcase = sequelize.define(
    'algoShowcase',
    {
      assetId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      type: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      timestamps: false,
    },
  );

  algoShowcase.associate = (models) => {
    models.algoShowcase.belongsTo(models.user, {
      foreignKey: {
        allowNull: false,
      },
    });
  };

  return algoShowcase;
}
