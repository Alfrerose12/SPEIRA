const swaggerDefination = {
  openapi: '3.0.0',
  info: {
    title: 'API de Speira',
    version: '1.0.0',
    description: 'API para gestionar los datos de los sensores del cultivo de espirulina y llevar el control de usuarios.'
  },
  servers: [
    { url: 'https://api.speira.site/api', description: 'Servidor en producción' },
    { url: 'http://localhost:3000/api', description: 'Servidor local' }
  ],
  paths: {
    '/datos': {
      post: {
        tags: ['Datos'],
        summary: 'Registrar datos de sensores',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  nombre: { type: 'string', example: 'Estanque 1' },
                  ph: { type: 'number', example: 7.5 },
                  temperaturaAgua: { type: 'number', example: 30.0 },
                  temperaturaAmbiente: { type: 'number', example: 25.0 },
                  humedad: { type: 'number', example: 60.0 },
                  luminosidad: { type: 'number', example: 500 },
                  conductividadElectrica: { type: 'number', example: 1500 },
                  co2: { type: 'number', example: 400 }
                },
                required: ['nombre', 'ph', 'temperaturaAgua', 'temperaturaAmbiente', 'humedad', 'luminosidad', 'conductividadElectrica', 'co2']
              }
            }
          }
        },
        responses: {
          201: {
            description: 'Datos registrados exitosamente',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/DatosSensor'
                }
              }
            }
          },
          404: {
            description: 'Estanque no encontrado',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    error: { type: 'string', example: 'Estanque no encontrado' }
                  }
                }
              }
            }
          },
          400: {
            description: 'Parámetros inválidos o faltantes',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    error: { type: 'string', example: 'Parámetros inválidos o faltantes' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/datos/generales': {
      get: {
        tags: ['Datos'],
        summary: 'Obtener datos generales de sensores',
        description: 'Obtiene los datos generales de todos los sensores registrados.',
        responses: {
          200: {
            description: 'Datos generales obtenidos exitosamente',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/DatosSensor'
                  }
                }
              }
            }
          },
          404: {
            description: 'No se encontraron datos',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    error: { type: 'string', example: 'No se encontraron datos' }
                  }
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
    '/datos/{periodo}/{fecha}': {
      get: {
        tags: ['Datos'],
        summary: 'Obtener datos de sensores por período y fecha',
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
    '/datos/estanque/{nombre}': {
      get: {
        tags: ['Datos'],
        summary: 'Obtener datos de sensores por estanque',
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
    '/datos/reportes/estanque': {
      post: {
        tags: ['Datos'],
        summary: 'Generar reporte PDF por estanque',
        description: 'Genera un reporte PDF según el período especificado. Formatos de fecha requeridos:<br>' +
          '- Diario: YYYY-MM-DD (ej: 2025-01-01)<br>' +
          '- Semanal: YYYY-MM-DD (debe ser lunes, ej: 2025-01-06)<br>' +
          '- Mensual: YYYY-MM (ej: 2025-01)<br>' +
          '- Anual: YYYY (ej: 2025)',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  estanque: {
                    type: 'string',
                    description: 'Nombre del estanque',
                    example: 'Estanque 1'
                  },
                  periodo: {
                    type: 'string',
                    enum: ['diario', 'semanal', 'mensual', 'anual'],
                    description: 'Período del reporte'
                  },
                  fecha: {
                    type: 'string',
                    oneOf: [
                      {
                        pattern: '^\\d{4}-\\d{2}-\\d{2}$',
                        description: 'Formato para diario/semanal',
                        example: '2025-01-01'
                      },
                      {
                        pattern: '^\\d{4}-\\d{2}$',
                        description: 'Formato para mensual',
                        example: '2025-01'
                      },
                      {
                        pattern: '^\\d{4}$',
                        description: 'Formato para anual',
                        example: '2025'
                      }
                    ]
                  }
                },
                required: [ 'estanque', 'periodo', 'fecha']
              }
            }
          }
        },
        responses: {
          200: {
            description: 'PDF generado exitosamente',
            content: {
              'application/pdf': {
                schema: {
                  type: 'string',
                  format: 'binary'
                },
                example: 'data:application/pdf;base64,...'
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
    '/datos/reportes': {
      post: {
        tags: ['Datos'],
        summary: 'Generar reporte PDF general',
        description: 'Genera un reporte PDF según el período especificado. Formatos de fecha requeridos:<br>' +
          '- Diario: YYYY-MM-DD (ej: 2025-01-01)<br>' +
          '- Semanal: YYYY-MM-DD (debe ser lunes, ej: 2025-01-06)<br>' +
          '- Mensual: YYYY-MM (ej: 2025-01)<br>' +
          '- Anual: YYYY (ej: 2025)',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  periodo: {
                    type: 'string',
                    enum: ['diario', 'semanal', 'mensual', 'anual'],
                    description: 'Período del reporte'
                  },
                  fecha: {
                    type: 'string',
                    oneOf: [
                      {
                        pattern: '^\\d{4}-\\d{2}-\\d{2}$',
                        description: 'Formato para diario/semanal',
                        example: '2025-01-01'
                      },
                      {
                        pattern: '^\\d{4}-\\d{2}$',
                        description: 'Formato para mensual',
                        example: '2025-01'
                      },
                      {
                        pattern: '^\\d{4}$',
                        description: 'Formato para anual',
                        example: '2025'
                      }
                    ]
                  }
                },
                required: ['periodo', 'fecha']
              }
            }
          }
        },
        responses: {
          200: {
            description: 'PDF generado exitosamente',
            content: {
              'application/pdf': {
                schema: {
                  type: 'string',
                  format: 'binary'
                },
                example: 'data:application/pdf;base64,...'
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
    '/estanque': {
      post: {
        tags: ['Estanque'],
        summary: 'Crear estanque',
        description: 'Crea un nuevo estanque en el sistema.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  nombre: {
                    type: 'string',
                    description: 'Nombre del estanque',
                    example: 'Estanque 1'
                  }
                },
                required: ['nombre']
              }
            }
          }
        },
        responses: {
          201: {
            description: 'Estanque creado exitosamente',
            content: {
              'application/json': {
                schema: {
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
    '/estanque/{nombre}': {
      put: {
        tags: ['Estanque'],
        summary: 'Editar estanque',
        description: 'Actualiza los datos de un estanque específico.',
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
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  nuevoNombre: {
                    type: 'string',
                    description: 'Nuevo nombre del estanque',
                    example: 'Estanque 1 Modificado'
                  }
                },
                required: ['nuevoNombre']
              }
            }
          }
        },
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
      },
      delete: {
        tags: ['Estanque'],
        summary: 'Eliminar estanque',
        description: 'Elimina un estanque específico por su nombre.',
        parameters: [
          {
            name: 'nombre',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
              description: 'Nombre del estanque a eliminar',
              example: 'Estanque 1'
            }
          }
        ],
        responses: {
          200: {
            description: 'Estanque eliminado exitosamente',
            content: {
              'application/json': {
                example: { mensaje: "Estanque eliminado exitosamente" }
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
                      _id: { type: 'string', example: '60d5f484f1b2c8a4b8e4c8a4' },
                      nombre: { type: 'string', example: 'Estanque 1' },
                      DatosSensor: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            id: { type: 'string', example: '60d5f484f1b2c8a4b8e4c8a4' },
                            ph: { type: 'number', example: 7.5 },
                            temperaturaAgua: { type: 'number', example: 30.0 },
                            temperaturaAmbiente: { type: 'number', example: 25.0 },
                            humedad: { type: 'number', example: 60.0 },
                            luminosidad: { type: 'number', example: 500 },
                            conductividadElectrica: { type: 'number', example: 1500 },
                            co2: { type: 'number', example: 400 },
                            fecha: { type: 'string', format: 'date-time', example: '2025-01-01T14:30:00.000Z' }
                          }
                        }
                      },
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
    '/usuario/registro': {
      post: {
        tags: ['Usuario'],
        summary: 'Registrar usuario',
        description: 'Registra un nuevo usuario en el sistema.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  nombre: { type: 'string', description: 'Nombre del usuario', example: 'Alfonso Pérez' },
                  email: { type: 'string', format: 'email', description: 'Email del usuario', example: 'alfonso@example.com' },
                  rol: { type: 'string', enum: ['admin', 'user'], description: 'Rol del usuario', example: 'user' },
                  password: { type: 'string', description: 'Contraseña del usuario', example: 'password123' }
                }
              }
            }
          }
        },
        responses: {
          201: {
            description: 'Usuario registrado exitosamente',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    id: { type: 'string', example: '60d5f484f1b2c8a4b8e4c8a4' },
                    nombre: { type: 'string', example: 'Alfonso Pérez' },
                    email: { type: 'string', format: 'email', example: 'alfonso@example.com' },
                    rol: { type: 'string', enum: ['admin', 'user'], example: 'user' },
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
    '/usuario/{id}': {
      put: {
        tags: ['Usuario'],
        summary: 'Editar usuario',
        description: 'Actualiza los datos de un usuario específico. Se pueden enviar uno o más de los siguientes campos: nombre, email y/o contraseña.',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'ID del usuario a editar',
            schema: {
              type: 'string',
              example: '60d5f484f1b2c8a4b8e4c8a4'
            }
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  nombre: { type: 'string', description: 'Nuevo nombre del usuario', example: 'Alfonso Pérez' },
                  email: { type: 'string', format: 'email', description: 'Nuevo correo electrónico', example: 'alfonso@example.com' },
                  password: { type: 'string', description: 'Nueva contraseña', example: 'nuevaPassword123' }
                },
                required: []
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Usuario editado exitosamente',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    id: { type: 'string', example: '60d5f484f1b2c8a4b8e4c8a4' },
                    nombre: { type: 'string', example: 'Alfonso Pérez' },
                    email: { type: 'string', format: 'email', example: 'alfonso@example.com' },
                    rol: { type: 'string', enum: ['admin', 'user'], example: 'user' },
                    fechaCreacion: { type: 'string', format: 'date-time', example: '2025-01-01T14:30:00.000Z' }
                  }
                }
              }
            }
          },
          400: {
            description: 'Email duplicado u otro error de validación',
            content: {
              'application/json': {
                example: { error: 'El email ya está registrado por otro usuario' }
              }
            }
          },
          404: {
            description: 'Usuario no encontrado',
            content: {
              'application/json': {
                example: { error: 'Usuario no encontrado' }
              }
            }
          },
          500: {
            description: 'Error inesperado en el servidor',
            content: {
              'application/json': {
                example: { error: 'Error al editar usuario', detalles: 'Mensaje técnico del error' }
              }
            }
          }
        }
      },
      delete: {
        tags: ['Usuario'],
        summary: 'Eliminar usuario',
        description: 'Elimina un usuario específico por su ID.',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
              description: 'ID del usuario a eliminar',
              example: '60d5f484f1b2c8a4b8e4c8a4'
            }
          }
        ],
        responses: {
          200: {
            description: 'Usuario eliminado exitosamente',
            content: {
              'application/json': {
                example: { mensaje: "Usuario eliminado exitosamente" }
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
    },
    '/usuario/iniciar-sesion': {
      post: {
        tags: ['Usuario'],
        summary: 'Iniciar sesión',
        description: 'Inicia sesión con las credenciales del usuario.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: { type: 'string', format: 'email', description: 'Email del usuario', example: 'alfonso@example.com' },
                  password: { type: 'string', description: 'Contraseña del usuario', example: 'password123' }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Inicio de sesión exitoso',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    id: { type: 'string', example: '60d5f484f1b2c8a4b8e4c8a4' },
                    nombre: { type: 'string', example: 'Alfonso Pérez' },
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
    '/usuario/cerrar-sesion': {
      get: {
        tags: ['Usuario'],
        summary: 'Cerrar sesión',
        description: 'Cierra la sesión del usuario actual.',
        responses: {
          200: {
            description: 'Sesión cerrada exitosamente',
            content: {
              'application/json': {
                example: { mensaje: "Sesión cerrada exitosamente" }
              }
            }
          },
          401: {
            description: 'No se encontró sesión activa',
            content: {
              'application/json': {
                example: { error: "No se encontró sesión activa" }
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
                      nombre: { type: 'string', example: 'Alfonso Pérez' },
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
    '/usuarios/{nombre}': {
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
              example: 'Alfonso Pérez'
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
                    nombre: { type: 'string', example: 'Alfonso Pérez' },
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
      Usuario: {
        type: 'object',
        properties: {
          id: { type: 'string', example: '60d5f484f1b2c8a4b8e4c8a4' },
          nombre: { type: 'string', example: 'Alfonso Pérez' },
          email: { type: 'string', format: 'email', example: 'alfonso.perez@example.com' },
          createdAt: { type: 'string', format: 'date-time', example: '2025-01-01T14:30:00.000Z' },
          updatedAt: { type: 'string', format: 'date-time', example: '2025-01-01T15:45:00.000Z' }
        }
      },
      Estanque: {
        type: 'object',
        properties: {
          id: { type: 'string', example: '60d5f484f1b2c8a4b8e4c8a4' },
          nombre: { type: 'string', example: 'Estanque 1' },
          createdAt: { type: 'string', format: 'date-time', example: '2025-01-01T14:30:00.000Z' },
          updatedAt: { type: 'string', format: 'date-time', example: '2025-01-01T15:45:00.000Z' }
        }
      },
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