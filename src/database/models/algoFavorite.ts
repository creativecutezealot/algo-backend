export default function (sequelize, DataTypes) {
  const algoFavorite = sequelize.define(
    'algoFavorite',
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

  algoFavorite.associate = (models) => {
    models.algoFavorite.belongsTo(models.user, {
      foreignKey: {
        allowNull: false,
      },
    });
  };

  return algoFavorite;
}
