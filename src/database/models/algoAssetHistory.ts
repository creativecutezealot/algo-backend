export default function (sequelize, DataTypes) {
  const algoAssetHistory = sequelize.define(
    'algoAssetHistory',
    {
      assetId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      unitName: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      liquidity: {
        type: DataTypes.DOUBLE,
        allowNull: true,
      },
      lastDayVolume: {
        type: DataTypes.DOUBLE,
        allowNull: true,
      },
      price: {
        type: DataTypes.DOUBLE,
        allowNull: true,
      },
      lastDayPriceChange: {
        type: DataTypes.DOUBLE,
        allowNull: true,
      },
      createdDate: {
        type: DataTypes.DATE,
        allowNull: false
      },
      isVerified: {
        type: DataTypes.BOOLEAN,
        allowNull: false
      },
    },
    {
      timestamps: false,
      freezeTableName: true,
    },
  );

  algoAssetHistory.associate = (models) => {};

  return algoAssetHistory;
}
