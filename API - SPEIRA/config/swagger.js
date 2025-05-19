const os = require('os');

const getLocalIPAddress = () => {
  const interfaces = os.networkInterfaces();
  for (const name in interfaces) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return '127.0.0.1';
};

const localIP = getLocalIPAddress();

const swaggerDefination = {
  openapi: '3.0.0',
  info: {
    title: 'API de Speira',
    version: '1.0.0',
    description: 'API para gestionar los datos de los sensores del cultivo de espirulina y llevar el control de usuarios.'
  },
  servers: [
    { url: 'http://localhost:3000/api', description: 'Servidor local' },
    { url: `http://${localIP}:3000/api`, description: 'Servidor en red local' }
  ],
  paths: {
    '/datos': {
      post: {
        tags: ['Datos'],
        summary: 'Registrar datos de sensores',
        parameters: [
          {
            name: 'nombre',
            in: 'query',
            required: true,
            schema: {
              type: 'string',
              description: 'Nombre del estanque',
              example: 'Estanque 1'
            }
          },
          {
            name: 'temperatura',
            in: 'query',
            required: true,
            schema: { type: 'number', format: 'float', example: 25.5 }
          },
          {
            name: 'ph',
            in: 'query',
            required: true,
            schema: { type: 'number', format: 'float', example: 8.2 }
          },
          {
            name: 'salinidad',
            in: 'query',
            required: true,
            schema: { type: 'number', format: 'float', example: 35.0 }
          },
          {
            name: 'iluminacion',
            in: 'query',
            required: true,
            schema: { type: 'number', format: 'float', example: 1200 }
          },
          {
            name: 'humedad',
            in: 'query',
            required: true,
            schema: { type: 'number', format: 'float', example: 60 }
          },
          {
            name: 'agitacion',
            in: 'query',
            required: true,
            schema: { type: 'number', format: 'float', example: 30 }
          }
        ],
        responses: {
          201: { description: 'Datos registrados exitosamente' },
          400: { description: 'Parámetros inválidos o faltantes' }
        }
      }
    },
    '/datos/estanque/nombre/{nombre}': {
      get: {
        tags: ['Datos'],
        summary: 'Obtener datos por estanque',
        description: 'Obtiene datos de un estanque específico.',
        parameters: [
          {
            name: 'nombre',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
              description: 'Nombre del estanque',
              example: 'Estanque 1'
            }
          }
        ],
        responses: {
          200: {
            description: 'Datos del estanque',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/DatosSensorArray'
                }
              }
            }
          },
          404: {
            description: 'Estanque no encontrado',
            content: {
              'application/json': {
                example: { error: "Estanque no encontrado" }
              }
            }
          }
        }
      }
    },
    '/estanque': {
      post: {
        tags: ['Estanque'],
        summary: 'Crear estanque',
        description: 'Crea un nuevo estanque.',
        parameters: [
          {
            name: 'nombre',
            in: 'query',
            required: true,
            schema: {
              type: 'string',
              description: 'Nombre del estanque',
              example: 'Estanque 1'
            }
          }
        ],
        responses: {
          201: {
            description: 'Estanque creado exitosamente',
            content: {
              'application/json': {
                example: { mensaje: "Estanque creado exitosamente" }
              }
            }
          },
          400: {
            description: 'Error al crear el estanque',
            content: {
              'application/json': {
                example: { error: "Error al crear el estanque" }
              }
            }
          }
        }
      }
    },
    '/estanques': {
      get: {
        tags: ['Estanque'],
        summary: 'Obtener lista de estanques',
        description: 'Obtiene una lista de todos los estanques.',
        responses: {
          200: {
            description: 'Lista de estanques',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: 'string', example: '60d5f484f1b2c8a4b8e4c8a4' },
                      nombre: { type: 'string', example: 'Estanque 1' },
                      createdAt: { type: 'string', format: 'date-time', example: '2025-01-01T14:30:00.000Z' },
                      updatedAt: { type: 'string', format: 'date-time', example: '2025-01-01T15:45:00.000Z' }
                    }
                  }
                }
              }
            }
          },
          404: {
            description: 'No se encontraron estanques',
            content: {
              'application/json': {
                example: { error: "No se encontraron estanques" }
              }
            }
          }
        }
      }
    },
    '/estanque/{id}': {
      put: {
        tags: ['Estanque'],
        summary: 'Editar estanque',
        description: 'Actualiza los datos de un estanque específico.',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
              description: 'ID del estanque'
            }
          },
          {
            name: 'nombre',
            in: 'query',
            required: true,
            schema: {
              type: 'string',
              description: 'Nombre del estanque',
              example: 'Estanque 1'
            }
          }
        ],
        responses: {
          200: {
            description: 'Estanque actualizado exitosamente',
            content: {
              'application/json': {
                example: { mensaje: "Estanque actualizado exitosamente" }
              }
            }
          },
          404: {
            description: 'Estanque no encontrado',
            content: {
              'application/json': {
                example: { error: "Estanque no encontrado" }
              }
            }
          }
        }
      }
    },
    '/datos/{periodo}/{fecha}': {
      get: {
        tags: ['Reportes'],
        summary: 'Obtener datos por período',
        description: 'Obtiene datos según el período especificado. Formatos de fecha requeridos:<br>' +
          '- Diario: YYYY-MM-DD (ej: 2025-01-01)<br>' +
          '- Semanal: YYYY-MM-DD (debe ser lunes, ej: 2025-01-06)<br>' +
          '- Mensual: YYYY-MM (ej: 2025-01)<br>' +
          '- Anual: YYYY (ej: 2025)',
        parameters: [
          {
            name: 'periodo',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
              enum: ['diario', 'semanal', 'mensual', 'anual'],
              description: 'Período del reporte'
            }
          },
          {
            name: 'fecha',
            in: 'path',
            required: true,
            schema: {
              oneOf: [
                {
                  type: 'string',
                  pattern: '^\\d{4}-\\d{2}-\\d{2}$',
                  description: 'Formato para diario/semanal',
                  example: '2025-01-01'
                },
                {
                  type: 'string',
                  pattern: '^\\d{4}-\\d{2}$',
                  description: 'Formato para mensual',
                  example: '2025-01'
                },
                {
                  type: 'string',
                  pattern: '^\\d{4}$',
                  description: 'Formato para anual',
                  example: '2025'
                }
              ]
            }
          }
        ],
        responses: {
          200: {
            description: 'Datos del período',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/DatosSensorArray'
                }
              }
            }
          },
          400: {
            description: 'Error en parámetros',
            content: {
              'application/json': {
                examples: {
                  formatoInvalido: {
                    value: {
                      error: "Formato de fecha inválido",
                      detalles: "Revise el formato requerido para el período seleccionado"
                    }
                  },
                  fechaNoLunes: {
                    value: {
                      error: "Fecha inválida para reporte semanal",
                      detalles: "Para reportes semanales debe proporcionar un lunes"
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/reportes': {
      post: {
        tags: ['Reportes'],
        summary: 'Generar reporte PDF',
        description: 'Genera un reporte PDF según el período especificado. Formatos de fecha requeridos:<br>' +
          '- Diario: YYYY-MM-DD (ej: 2025-01-01)<br>' +
          '- Semanal: YYYY-MM-DD (debe ser lunes, ej: 2025-01-06)<br>' +
          '- Mensual: YYYY-MM (ej: 2025-01)<br>' +
          '- Anual: YYYY (ej: 2025)',
        parameters: [
          {
            name: 'periodo',
            in: 'query',
            required: true,
            schema: {
              type: 'string',
              enum: ['diario', 'semanal', 'mensual', 'anual'],
              example: 'diario',
              description: 'Tipo de reporte a generar'
            }
          },
          {
            name: 'fecha',
            in: 'query',
            required: true,
            schema: {
              oneOf: [
                {
                  type: 'string',
                  pattern: '^\\d{4}-\\d{2}-\\d{2}$',
                  description: 'Formato para diario/semanal',
                  example: '2025-01-01'
                },
                {
                  type: 'string',
                  pattern: '^\\d{4}-\\d{2}$',
                  description: 'Formato para mensual',
                  example: '2025-01'
                },
                {
                  type: 'string',
                  pattern: '^\\d{4}$',
                  description: 'Formato para anual',
                  example: '2025'
                }
              ]
            }
          }
        ],
        responses: {
          200: {
            description: 'PDF generado exitosamente',
            content: {
              'application/pdf': {
                schema: {
                  type: 'string',
                  format: 'binary'
                }
              }
            }
          },
          400: {
            description: 'Error en parámetros',
            content: {
              'application/json': {
                examples: {
                  formatoInvalido: {
                    value: {
                      error: "Formato de fecha inválido",
                      detalles: "Revise el formato requerido para el período seleccionado"
                    }
                  },
                  fechaNoLunes: {
                    value: {
                      error: "Fecha inválida para reporte semanal",
                      detalles: "Para reportes semanales debe proporcionar un lunes"
                    }
                  }
                }
              }
            }
          },
          404: {
            description: 'No hay datos para el período seleccionado',
            content: {
              'application/json': {
                example: {
                  error: "No hay datos para el período seleccionado"
                }
              }
            }
          }
        }
      }
    },
    '/registrar': {
      post: {
        tags: ['Usuario'],
        summary: 'Registrar usuario',
        description: 'Registra un nuevo usuario en el sistema.',
        parameters: [
          {
            name: 'nombre',
            in: 'query',
            required: true,
            schema: {
              type: 'string',
              description: 'Nombre del usuario',
              example: 'Juan Pérez'
            }
          },
          {
            name: 'email',
            in: 'query',
            required: true,
            schema: {
              type: 'string',
              format: 'email',
              description: 'Email del usuario',
              example: 'alfonso@example.com'
            }
          },
          {
            name: 'password',
            in: 'query',
            required: true,
            schema: {
              type: 'string',
              description: 'Contraseña del usuario',
              example: 'password123'
            }
          }
        ],
        responses: {
          201: {
            description: 'Usuario registrado exitosamente',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    id: { type: 'string', example: '60d5f484f1b2c8a4b8e4c8a4' },
                    nombre: { type: 'string', example: 'Juan Pérez' },
                    email: { type: 'string', format: 'email', example: '' },
                    fechaCreacion: { type: 'string', format: 'date-time', example: '2025-01-01T14:30:00.000Z' }
                  }
                }
              }
            }
          },
          400: {
            description: 'Error al registrar el usuario',
            content: {
              'application/json': {
                example: { error: "Error al registrar el usuario" }
              }
            }
          }
        }
      }
    },
    '/iniciar-sesion': {
      post: {
        tags: ['Usuario'],
        summary: 'Iniciar sesión',
        description: 'Inicia sesión con las credenciales del usuario.',
        parameters: [
          {
            name: 'email',
            in: 'query',
            required: true,
            schema: {
              type: 'string',
              format: 'email',
              description: 'Email del usuario',
              example: 'juan@example.com'
            }
          },
          {
            name: 'password',
            in: 'query',
            required: true,
            schema: {
              type: 'string',
              description: 'Contraseña del usuario',
              example: 'password123'
            }
          }
        ],
        responses: {
          200: {
            description: 'Inicio de sesión exitoso',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    id: { type: 'string', example: '60d5f484f1b2c8a4b8e4c8a4' },
                    nombre: { type: 'string', example: 'Juan Pérez' },
                    email: { type: 'string', format: 'email', example: '' },
                    fechaCreacion: { type: 'string', format: 'date-time', example: '2025-01-01T14:30:00.000Z' }
                  }
                }
              }
            }
          },
          401: {
            description: 'Credenciales inválidas',
            content: {
              'application/json': {
                example: { error: "Credenciales inválidas" }
              }
            }
          }
        }
      }
    },
    '/usuarios': {
      get: {
        tags: ['Usuario'],
        summary: 'Obtener lista de usuarios',
        description: 'Obtiene una lista de todos los usuarios registrados.',
        responses: {
          200: {
            description: 'Lista de usuarios',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: 'string', example: '60d5f484f1b2c8a4b8e4c8a4' },
                      nombre: { type: 'string', example: 'Juan Pérez' },
                      email: { type: 'string', format: 'email', example: '' },
                      fechaCreacion: { type: 'string', format: 'date-time', example: '2025-01-01T14:30:00.000Z' }
                    }
                  }
                }
              }
            }
          },
          404: {
            description: 'No se encontraron usuarios',
            content: {
              'application/json': {
                example: { error: "No se encontraron usuarios" }
              }
            }
          }
        }
      }
    },
    '/usuarios/nombre/{nombre}': {
      get: {
        tags: ['Usuario'],
        summary: 'Obtener usuario por nombre',
        description: 'Obtiene un usuario específico por su nombre.',
        parameters: [
          {
            name: 'nombre',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
              description: 'Nombre del usuario',
              example: 'Juan Pérez'
            }
          }
        ],
        responses: {
          200: {
            description: 'Usuario encontrado',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    id: { type: 'string', example: '60d5f484f1b2c8a4b8e4c8a4' },
                    nombre: { type: 'string', example: 'Juan Pérez' },
                    email: { type: 'string', format: 'email', example: '' },
                    fechaCreacion: { type: 'string', format: 'date-time', example: '2025-01-01T14:30:00.000Z' }
                  }
                }
              }
            }
          },
          404: {
            description: 'Usuario no encontrado',
            content: {
              'application/json': {
                example: { error: "Usuario no encontrado" }
              }
            }
          }
        }
      }
    }
  },
  components: {
    schemas: {
      DatosSensor: {
        type: 'object',
        properties: {
          temperatura: { type: 'number', example: 25.5 },
          ph: { type: 'number', example: 8.2 },
          salinidad: { type: 'number', example: 35.0 },
          iluminacion: { type: 'number', example: 1200 },
          humedad: { type: 'number', example: 60 },
          agitacion: { type: 'number', example: 30 },
          fecha: {
            type: 'string',
            format: 'date-time',
            example: '2025-01-01T14:30:00.000Z',
            description: 'Fecha y hora de la medición en zona horaria de México'
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            example: '2025-01-01T14:30:00.000Z',
            description: 'Fecha de creación automática'
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            example: '2025-01-01T15:45:00.000Z',
            description: 'Fecha de última actualización'
          },
          __v: {
            type: 'number',
            example: 0,
            description: 'Versión del documento'
          }
        },
        required: [
          'temperatura',
          'ph',
          'salinidad',
          'iluminacion',
          'humedad',
          'agitacion'
        ]
      },
      DatosSensorArray: {
        type: 'array',
        items: {
          $ref: '#/components/schemas/DatosSensor'
        }
      }
    }
  }
};

module.exports = swaggerDefination;