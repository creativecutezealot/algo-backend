export default function (sequelize, DataTypes) {
  const algoPoolHistory = sequelize.define(
    'algoPoolHistory',
    {
      address: {
        type: DataTypes.STRING(80),
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
      assetOneId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      assetTwoId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      assetOneUnitName: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      assetTwoUnitName: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      assetOneName: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      assetTwoName: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      assetOneReserves: {
        type: DataTypes.DOUBLE,
        allowNull: true,
      },
      assetTwoReserves: {
        type: DataTypes.DOUBLE,
        allowNull: true,
      },
      liquidity: {
        type: DataTypes.DOUBLE,
        allowNull: true,
      },
      lastDayVolume: {
        type: DataTypes.DOUBLE,
        allowNull: true,
      },
      lastWeekVolume: {
        type: DataTypes.DOUBLE,
        allowNull: true,
      },
      lastDayFees: {
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

  algoPoolHistory.associate = (models) => {};

  return algoPoolHistory;
}
