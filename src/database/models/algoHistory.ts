export default function (sequelize, DataTypes) {
  const algoHistory = sequelize.define(
    'algoHistory',
    {
      totalLiquidity: {
        type: DataTypes.DOUBLE,
        allowNull: true,
      },
      lastDayVolume: {
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
    },
    {
      timestamps: false,
      freezeTableName: true,
    },
  );

  algoHistory.associate = (models) => {};

  return algoHistory;
}
