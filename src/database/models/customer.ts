import { DataTypes } from 'sequelize';
import moment from 'moment';

export default function (sequelize) {
  const customer = sequelize.define(
    'customer',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
          len: [2, 255],
          notEmpty: true,
        }
      },
      birthdate: {
        type: DataTypes.DATEONLY,
        get: function() {
          // @ts-ignore
          return this.getDataValue('birthdate')
            ? moment
                // @ts-ignore
                .utc(this.getDataValue('birthdate'))
                .format('YYYY-MM-DD')
            : null;
        },
      },
      gender: {
        type: DataTypes.TEXT,
        validate: {
          isIn: [[
            "male",
            "female"
          ]],
        }
      },
      importHash: {
        type: DataTypes.STRING(255),
        allowNull: true,    
        validate: {
          len: [0, 255],
        },    
      },
    },
    {
      indexes: [
        {
          unique: true,
          fields: ['importHash', 'tenantId'],
          where: {
            deletedAt: null,
          },
        },

      ],
      timestamps: true,
      paranoid: true,
    },
  );

  customer.associate = (models) => {



    
    models.customer.belongsTo(models.tenant, {
      as: 'tenant',
      foreignKey: {
        allowNull: false,
      },
    });

    models.customer.belongsTo(models.user, {
      as: 'createdBy',
    });

    models.customer.belongsTo(models.user, {
      as: 'updatedBy',
    });
  };

  return customer;
}
