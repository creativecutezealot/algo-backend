import moment from 'moment';
export default function (sequelize, DataTypes) {
  const changeLog = sequelize.define(
    'changeLog',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      description: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      date: {
        type: DataTypes.DATEONLY,
        get: function () {
          // @ts-ignore
          return this.getDataValue('date')
            ? moment
              // @ts-ignore
              .utc(this.getDataValue('date'))
              .format('YYYY-MM-DD')
            : null;
        },
      },
    },
    {
      timestamps: false,
    },
  );

  changeLog.associate = (models) => { };

  return changeLog;
}
