export default function (sequelize, DataTypes) {
  const note = sequelize.define(
    'note',
    {
      id: {
        type: DataTypes.STRING,
        defaultValue: 'default',
        primaryKey: true,
      },
      assetId: {
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

  note.associate = (models) => {

    models.note.belongsTo(models.tenant, {
      as: 'tenant',
      foreignKey: {
        allowNull: false,
      },
    });
  };

  return note;
}
