import { DataTypes } from 'sequelize';

export default function (sequelize) {
  const product = sequelize.define(
    'product',
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
      description: {
        type: DataTypes.TEXT,
        validate: {
          len: [0, 21845],
        }
      },
      unitPrice: {
        type: DataTypes.DECIMAL(24, 2),
        allowNull: false,
        validate: {
          min: 0.01,
          max: 99999,
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

  product.associate = (models) => {


    models.product.hasMany(models.file, {
      as: 'photos',
      foreignKey: 'belongsToId',
      constraints: false,
      scope: {
        belongsTo: models.product.getTableName(),
        belongsToColumn: 'photos',
      },
    });
    
    models.product.belongsTo(models.tenant, {
      as: 'tenant',
      foreignKey: {
        allowNull: false,
      },
    });

    models.product.belongsTo(models.user, {
      as: 'createdBy',
    });

    models.product.belongsTo(models.user, {
      as: 'updatedBy',
    });
  };

  return product;
}
