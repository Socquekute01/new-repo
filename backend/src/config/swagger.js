const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Product API',
    version: '1.0.0',
    description: 'API documentation for the Product app',
  },
  servers: [
    {
      url: 'http://localhost:5001/api',
      description: 'Local server',
    },
  ],
  tags: [
    { name: 'User', description: 'User management' },
    { name: 'Admin', description: 'Admin management' },
    { name: 'Roles', description: 'Role management' },
    { name: 'Permissions', description: 'Permission management' },
    { name: 'Products', description: 'Product management' },
    { name: 'Categories', description: 'Category management' },
    { name: 'Reviews', description: 'Review management' },
    { name: 'Recommendations', description: 'AI recommendation management' },
    { name: 'Chatbot', description: 'Chatbot assistant' },
    { name: 'ChatbotLogs', description: 'Chatbot log management' },
    { name: 'AIBehaviorLogs', description: 'AI behavior log management' },
    { name: 'Carts', description: 'Cart management' },
    { name: 'CartItems', description: 'Cart item management' },
    { name: 'Orders', description: 'Order management' },
    { name: 'OrderItems', description: 'Order item management' },
    { name: 'Payments', description: 'Payment management' },
    { name: 'VNPay', description: 'VNPay payment integration' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      RegisterRequest: {
        type: 'object',
        required: ['username', 'email', 'password'],
        properties: {
          username: { type: 'string', example: 'tuanan' },
          name: { type: 'string', example: 'Tuan An' },
          email: { type: 'string', example: 'tuanan@example.com' },
          password: { type: 'string', example: 'secret123' },
        },
      },
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', example: 'tuanan@example.com' },
          password: { type: 'string', example: 'secret123' },
        },
      },
      AuthResponse: {
        type: 'object',
        properties: {
          token: { type: 'string' },
          user: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              username: { type: 'string' },
              name: { type: 'string' },
              email: { type: 'string' },
              role: { type: 'string' },
              roles: {
                type: 'array',
                items: { $ref: '#/components/schemas/Role' },
              },
            },
          },
        },
      },
      UpdateUserRequest: {
        type: 'object',
        properties: {
          username: { type: 'string', example: 'tuanan' },
          name: { type: 'string', example: 'Tuan An' },
          email: { type: 'string', example: 'tuanan@example.com' },
          phone: { type: 'string', example: '+84 901234567' },
          address: {
            type: 'object',
            properties: {
              street: { type: 'string' },
              city: { type: 'string' },
              state: { type: 'string' },
              country: { type: 'string' },
              zip: { type: 'string' },
            },
          },
        },
      },
      Permission: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          key: { type: 'string', example: 'products:create' },
          description: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      PermissionCreateRequest: {
        type: 'object',
        required: ['key'],
        properties: {
          key: { type: 'string', example: 'products:create' },
          description: { type: 'string', example: 'Create products' },
        },
      },
      Role: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          name: { type: 'string', example: 'product_manager' },
          description: { type: 'string' },
          permissions: {
            type: 'array',
            items: { $ref: '#/components/schemas/Permission' },
          },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      RoleCreateRequest: {
        type: 'object',
        required: ['name'],
        properties: {
          name: { type: 'string', example: 'product_manager' },
          description: { type: 'string', example: 'Manage products' },
          permissionIds: { type: 'array', items: { type: 'string' } },
        },
      },
      RoleUpdateRequest: {
        type: 'object',
        properties: {
          name: { type: 'string', example: 'product_manager' },
          description: { type: 'string' },
          permissionIds: { type: 'array', items: { type: 'string' } },
        },
      },
      AssignRolesRequest: {
        type: 'object',
        required: ['roleIds'],
        properties: {
          roleIds: { type: 'array', items: { type: 'string' } },
          replace: { type: 'boolean', example: false },
        },
      },
      AddPermissionsToRoleRequest: {
        type: 'object',
        required: ['permissionIds'],
        properties: {
          permissionIds: { type: 'array', items: { type: 'string' } },
        },
      },
      Category: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          name: { type: 'string' },
          description: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      CategoryRequest: {
        type: 'object',
        required: ['name'],
        properties: {
          name: { type: 'string', example: 'Laptops' },
          description: { type: 'string', example: 'Laptop products' },
        },
      },
      Product: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          name: { type: 'string' },
          description: { type: 'string' },
          price: { type: 'number' },
          stock: { type: 'number' },
          images: { type: 'array', items: { type: 'string' } },
          size: { type: 'array', items: { type: 'string' } },
          averageRating: { type: 'number' },
          category: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      ProductCreateRequest: {
        type: 'object',
        required: ['name', 'price', 'stock', 'category'],
        properties: {
          name: { type: 'string', example: 'Macbook Pro' },
          description: { type: 'string', example: 'M3 Max 16-inch' },
          price: { type: 'number', example: 2499 },
          stock: { type: 'number', example: 10 },
          images: { type: 'array', items: { type: 'string' } },
          size: { type: 'array', items: { type: 'string' }, example: ['M', 'L'] },
          averageRating: { type: 'number', example: 4.8 },
          category: { type: 'string', example: 'CATEGORY_ID' },
        },
      },
      ProductUpdateRequest: {
        type: 'object',
        properties: {
          name: { type: 'string', example: 'Updated name' },
          description: { type: 'string', example: 'Updated description' },
          price: { type: 'number', example: 1999 },
          stock: { type: 'number', example: 5 },
          images: { type: 'array', items: { type: 'string' } },
          size: { type: 'array', items: { type: 'string' }, example: ['L', 'XL'] },
          averageRating: { type: 'number', example: 4.6 },
          category: { type: 'string', example: 'CATEGORY_ID' },
        },
      },
      Review: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          user: { type: 'string' },
          product: { type: 'string' },
          rating: { type: 'number' },
          comment: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      ReviewRequest: {
        type: 'object',
        required: ['user', 'product', 'rating'],
        properties: {
          user: { type: 'string' },
          product: { type: 'string' },
          rating: { type: 'number', example: 5 },
          comment: { type: 'string', example: 'Great!' },
        },
      },
      AIRecommendation: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          user: { type: 'string' },
          product: { type: 'string' },
          score: { type: 'number' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      AIRecommendationRequest: {
        type: 'object',
        required: ['user', 'product', 'score'],
        properties: {
          user: { type: 'string' },
          product: { type: 'string' },
          score: { type: 'number', example: 0.92 },
        },
      },
      ChatbotLog: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          user: { type: 'string' },
          message: { type: 'string' },
          response: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      ChatbotLogRequest: {
        type: 'object',
        required: ['user', 'message'],
        properties: {
          user: { type: 'string' },
          message: { type: 'string', example: 'Hello' },
          response: { type: 'string', example: 'Hi there!' },
        },
      },
      AIBehaviorLog: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          user: { type: 'string' },
          flow: { type: 'string', example: 'chatbot' },
          action: { type: 'string', example: 'chat_message' },
          message: { type: 'string' },
          productIds: {
            type: 'array',
            items: { type: 'string' },
          },
          metadata: { type: 'object' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      AIBehaviorLogRequest: {
        type: 'object',
        required: ['action'],
        properties: {
          flow: { type: 'string', example: 'chatbot' },
          action: { type: 'string', example: 'suggestion_click' },
          message: { type: 'string', example: 'User clicked suggestion' },
          productIds: {
            type: 'array',
            items: { type: 'string' },
          },
          metadata: { type: 'object' },
        },
      },
      Cart: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          user: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      CartRequest: {
        type: 'object',
        required: ['user'],
        properties: {
          user: { type: 'string' },
        },
      },
      CartMyResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          cart: { $ref: '#/components/schemas/Cart' },
          items: {
            type: 'array',
            items: { $ref: '#/components/schemas/CartItem' },
          },
        },
      },
      CartItem: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          cart: { type: 'string' },
          product: { type: 'string' },
          quantity: { type: 'number' },
          price: { type: 'number' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      CartItemRequest: {
        type: 'object',
        required: ['cart', 'product', 'quantity', 'price'],
        properties: {
          cart: { type: 'string' },
          product: { type: 'string' },
          quantity: { type: 'number', example: 2 },
          price: { type: 'number', example: 1999 },
        },
      },
      Order: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          user: { type: 'string' },
          email: { type: 'string' },
          shippingAddress: {
            type: 'object',
            properties: {
              firstName: { type: 'string' },
              lastName: { type: 'string' },
              phone: { type: 'string' },
              address: { type: 'string' },
              district: { type: 'string' },
              city: { type: 'string' },
            },
          },
          paymentMethod: { type: 'string', example: 'cod' },
          shippingFee: { type: 'number', example: 0 },
          totalAmount: { type: 'number' },
          status: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      OrderItem: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          order: { type: 'string' },
          product: { type: 'string' },
          quantity: { type: 'number' },
          price: { type: 'number' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      OrderCreateRequest: {
        type: 'object',
        required: ['user', 'items'],
        properties: {
          user: { type: 'string' },
          email: { type: 'string' },
          shippingAddress: {
            type: 'object',
            properties: {
              firstName: { type: 'string' },
              lastName: { type: 'string' },
              phone: { type: 'string' },
              address: { type: 'string' },
              district: { type: 'string' },
              city: { type: 'string' },
            },
          },
          paymentMethod: { type: 'string', example: 'cod' },
          shippingFee: { type: 'number', example: 0 },
          status: { type: 'string', example: 'pending' },
          items: {
            type: 'array',
            items: {
              type: 'object',
              required: ['product', 'quantity', 'price'],
              properties: {
                product: { type: 'string' },
                quantity: { type: 'number', example: 2 },
                price: { type: 'number', example: 1999 },
              },
            },
          },
        },
      },
      OrderUpdateRequest: {
        type: 'object',
        properties: {
          user: { type: 'string' },
          email: { type: 'string' },
          shippingAddress: {
            type: 'object',
            properties: {
              firstName: { type: 'string' },
              lastName: { type: 'string' },
              phone: { type: 'string' },
              address: { type: 'string' },
              district: { type: 'string' },
              city: { type: 'string' },
            },
          },
          paymentMethod: { type: 'string', example: 'vnpay' },
          shippingFee: { type: 'number', example: 0 },
          status: { type: 'string', example: 'paid' },
          items: {
            type: 'array',
            items: {
              type: 'object',
              required: ['product', 'quantity', 'price'],
              properties: {
                product: { type: 'string' },
                quantity: { type: 'number', example: 2 },
                price: { type: 'number', example: 1999 },
              },
            },
          },
        },
      },
      OrderItemRequest: {
        type: 'object',
        required: ['order', 'product', 'quantity', 'price'],
        properties: {
          order: { type: 'string' },
          product: { type: 'string' },
          quantity: { type: 'number', example: 2 },
          price: { type: 'number', example: 1999 },
        },
      },
      Payment: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          order: { type: 'string' },
          paymentMethod: { type: 'string' },
          paymentStatus: { type: 'string' },
          transactionCode: { type: 'string' },
          paidAt: { type: 'string', format: 'date-time' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      PaymentRequest: {
        type: 'object',
        required: ['order', 'paymentMethod', 'paymentStatus'],
        properties: {
          order: { type: 'string' },
          paymentMethod: { type: 'string', example: 'card' },
          paymentStatus: { type: 'string', example: 'paid' },
          transactionCode: { type: 'string', example: 'TXN123' },
          paidAt: { type: 'string', format: 'date-time' },
        },
      },
      VnpayCreateRequest: {
        type: 'object',
        required: ['orderId'],
        properties: {
          orderId: { type: 'string', example: 'ORDER_ID' },
          returnUrl: { type: 'string', example: 'http://localhost:5173/payment/vnpay-return' },
          locale: { type: 'string', example: 'vn' },
          bankCode: { type: 'string', example: 'NCB' },
        },
      },
      VnpayCreateResponse: {
        type: 'object',
        properties: {
          paymentUrl: { type: 'string' },
          orderId: { type: 'string' },
        },
      },
      VnpayReturnResponse: {
        type: 'object',
        properties: {
          isVerified: { type: 'boolean' },
          isSuccess: { type: 'boolean' },
          orderId: { type: 'string' },
          message: { type: 'string' },
        },
      },
    },
  },
  security: [
    { bearerAuth: [] },
  ],
  paths: {
    '/admin/stats': {
      get: {
        tags: ['Admin'],
        summary: 'Get admin dashboard stats',
        responses: {
          200: {
            description: 'OK',
            content: {
              'application/json': {
                schema: { type: 'object' },
              },
            },
          },
          401: { description: 'Unauthorized' },
          403: { description: 'Forbidden' },
        },
      },
    },
    '/users/register': {
      post: {
        tags: ['User'],
        summary: 'Register',
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RegisterRequest' },
            },
          },
        },
        responses: {
          201: {
            description: 'Created',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AuthResponse' },
              },
            },
          },
        },
      },
    },
    '/users/login': {
      post: {
        tags: ['User'],
        summary: 'Login',
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LoginRequest' },
            },
          },
        },
        responses: {
          200: {
            description: 'OK',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AuthResponse' },
              },
            },
          },
        },
      },
    },
    '/users/me': {
      get: {
        tags: ['User'],
        summary: 'Get current user',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'OK',
            content: {
              'application/json': {
                schema: { type: 'object' },
              },
            },
          },
          401: { description: 'Unauthorized' },
        },
      },
      put: {
        tags: ['User'],
        summary: 'Update current user profile',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateUserRequest' },
            },
          },
        },
        responses: {
          200: {
            description: 'OK',
            content: {
              'application/json': {
                schema: { type: 'object' },
              },
            },
          },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/users/{id}/roles': {
      get: {
        tags: ['User'],
        summary: 'Get roles for user',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: {
            description: 'OK',
            content: {
              'application/json': {
                schema: { type: 'object' },
              },
            },
          },
          401: { description: 'Unauthorized' },
          403: { description: 'Forbidden' },
        },
      },
      post: {
        tags: ['User'],
        summary: 'Assign roles to user',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/AssignRolesRequest' },
            },
          },
        },
        responses: {
          200: { description: 'OK' },
          401: { description: 'Unauthorized' },
          403: { description: 'Forbidden' },
        },
      },
    },
    '/users/{id}/roles/{roleId}': {
      delete: {
        tags: ['User'],
        summary: 'Remove role from user',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'roleId', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'OK' },
          401: { description: 'Unauthorized' },
          403: { description: 'Forbidden' },
        },
      },
    },
    '/roles': {
      get: {
        tags: ['Roles'],
        summary: 'Get all roles',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'OK',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Role' },
                },
              },
            },
          },
          401: { description: 'Unauthorized' },
          403: { description: 'Forbidden' },
        },
      },
      post: {
        tags: ['Roles'],
        summary: 'Create role',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RoleCreateRequest' },
            },
          },
        },
        responses: {
          201: {
            description: 'Created',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Role' },
              },
            },
          },
          401: { description: 'Unauthorized' },
          403: { description: 'Forbidden' },
        },
      },
    },
    '/roles/{id}': {
      get: {
        tags: ['Roles'],
        summary: 'Get role by ID',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: {
            description: 'OK',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Role' },
              },
            },
          },
          401: { description: 'Unauthorized' },
          403: { description: 'Forbidden' },
        },
      },
      put: {
        tags: ['Roles'],
        summary: 'Update role',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RoleUpdateRequest' },
            },
          },
        },
        responses: {
          200: {
            description: 'OK',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Role' },
              },
            },
          },
          401: { description: 'Unauthorized' },
          403: { description: 'Forbidden' },
        },
      },
      delete: {
        tags: ['Roles'],
        summary: 'Delete role',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'OK' },
          401: { description: 'Unauthorized' },
          403: { description: 'Forbidden' },
        },
      },
    },
    '/roles/{id}/permissions': {
      post: {
        tags: ['Roles'],
        summary: 'Add permissions to role',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/AddPermissionsToRoleRequest' },
            },
          },
        },
        responses: {
          200: {
            description: 'OK',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Role' },
              },
            },
          },
          401: { description: 'Unauthorized' },
          403: { description: 'Forbidden' },
        },
      },
    },
    '/roles/{id}/permissions/{permissionId}': {
      delete: {
        tags: ['Roles'],
        summary: 'Remove permission from role',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'permissionId', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: {
            description: 'OK',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Role' },
              },
            },
          },
          401: { description: 'Unauthorized' },
          403: { description: 'Forbidden' },
        },
      },
    },
    '/permissions': {
      get: {
        tags: ['Permissions'],
        summary: 'Get all permissions',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'OK',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Permission' },
                },
              },
            },
          },
          401: { description: 'Unauthorized' },
          403: { description: 'Forbidden' },
        },
      },
      post: {
        tags: ['Permissions'],
        summary: 'Create permission',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/PermissionCreateRequest' },
            },
          },
        },
        responses: {
          201: {
            description: 'Created',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Permission' },
              },
            },
          },
          401: { description: 'Unauthorized' },
          403: { description: 'Forbidden' },
        },
      },
    },
    '/permissions/{id}': {
      get: {
        tags: ['Permissions'],
        summary: 'Get permission by ID',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: {
            description: 'OK',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Permission' },
              },
            },
          },
          401: { description: 'Unauthorized' },
          403: { description: 'Forbidden' },
        },
      },
      put: {
        tags: ['Permissions'],
        summary: 'Update permission',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/PermissionCreateRequest' },
            },
          },
        },
        responses: {
          200: {
            description: 'OK',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Permission' },
              },
            },
          },
          401: { description: 'Unauthorized' },
          403: { description: 'Forbidden' },
        },
      },
      delete: {
        tags: ['Permissions'],
        summary: 'Delete permission',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'OK' },
          401: { description: 'Unauthorized' },
          403: { description: 'Forbidden' },
        },
      },
    },
    '/products': {
      get: {
        tags: ['Products'],
        summary: 'Get all products',
        security: [],
        responses: {
          200: {
            description: 'OK',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Product' },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['Products'],
        summary: 'Create product',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ProductCreateRequest' },
            },
          },
        },
        responses: {
          201: {
            description: 'Created',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Product' },
              },
            },
          },
        },
      },
    },
    '/products/{id}': {
      get: {
        tags: ['Products'],
        summary: 'Get product by ID',
        security: [],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          200: {
            description: 'OK',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Product' },
              },
            },
          },
          404: { description: 'Not found' },
        },
      },
      put: {
        tags: ['Products'],
        summary: 'Update product',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ProductUpdateRequest' },
            },
          },
        },
        responses: {
          200: {
            description: 'OK',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Product' },
              },
            },
          },
          404: { description: 'Not found' },
        },
      },
      delete: {
        tags: ['Products'],
        summary: 'Delete product',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          200: { description: 'OK' },
          404: { description: 'Not found' },
        },
      },
    },
    '/categories': {
      get: {
        tags: ['Categories'],
        summary: 'Get all categories',
        responses: {
          200: {
            description: 'OK',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Category' },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['Categories'],
        summary: 'Create category',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CategoryRequest' },
            },
          },
        },
        responses: {
          201: {
            description: 'Created',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Category' },
              },
            },
          },
        },
      },
    },
    '/categories/{id}': {
      get: {
        tags: ['Categories'],
        summary: 'Get category by ID',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: {
            description: 'OK',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/Category' } },
            },
          },
          404: { description: 'Not found' },
        },
      },
      put: {
        tags: ['Categories'],
        summary: 'Update category',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/CategoryRequest' } },
          },
        },
        responses: {
          200: {
            description: 'OK',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/Category' } },
            },
          },
          404: { description: 'Not found' },
        },
      },
      delete: {
        tags: ['Categories'],
        summary: 'Delete category',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'OK' },
          404: { description: 'Not found' },
        },
      },
    },
    '/reviews': {
      get: {
        tags: ['Reviews'],
        summary: 'Get all reviews',
        responses: {
          200: {
            description: 'OK',
            content: {
              'application/json': {
                schema: { type: 'array', items: { $ref: '#/components/schemas/Review' } },
              },
            },
          },
        },
      },
      post: {
        tags: ['Reviews'],
        summary: 'Create review',
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/ReviewRequest' } },
          },
        },
        responses: {
          201: {
            description: 'Created',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/Review' } },
            },
          },
        },
      },
    },
    '/reviews/{id}': {
      get: {
        tags: ['Reviews'],
        summary: 'Get review by ID',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: {
            description: 'OK',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/Review' } },
            },
          },
          404: { description: 'Not found' },
        },
      },
      put: {
        tags: ['Reviews'],
        summary: 'Update review',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/ReviewRequest' } },
          },
        },
        responses: {
          200: {
            description: 'OK',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/Review' } },
            },
          },
          404: { description: 'Not found' },
        },
      },
      delete: {
        tags: ['Reviews'],
        summary: 'Delete review',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'OK' },
          404: { description: 'Not found' },
        },
      },
    },
    '/recommendations': {
      get: {
        tags: ['Recommendations'],
        summary: 'Get all recommendations',
        responses: {
          200: {
            description: 'OK',
            content: {
              'application/json': {
                schema: { type: 'array', items: { $ref: '#/components/schemas/AIRecommendation' } },
              },
            },
          },
        },
      },
      post: {
        tags: ['Recommendations'],
        summary: 'Create recommendation',
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/AIRecommendationRequest' } },
          },
        },
        responses: {
          201: {
            description: 'Created',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/AIRecommendation' } },
            },
          },
        },
      },
    },
    '/recommendations/generate': {
      post: {
        tags: ['Recommendations'],
        summary: 'Generate recommendations with Gemini',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  userId: { type: 'string' },
                  prompt: { type: 'string', example: 'I like casual shoes' },
                  limit: { type: 'number', example: 6 },
                  candidateProductIds: {
                    type: 'array',
                    items: { type: 'string' },
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'OK',
            content: {
              'application/json': {
                schema: { type: 'object' },
              },
            },
          },
          400: { description: 'Bad request' },
          500: { description: 'Server error' },
        },
      },
    },
    '/recommendations/{id}': {
      get: {
        tags: ['Recommendations'],
        summary: 'Get recommendation by ID',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: {
            description: 'OK',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/AIRecommendation' } },
            },
          },
          404: { description: 'Not found' },
        },
      },
      put: {
        tags: ['Recommendations'],
        summary: 'Update recommendation',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/AIRecommendationRequest' } },
          },
        },
        responses: {
          200: {
            description: 'OK',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/AIRecommendation' } },
            },
          },
          404: { description: 'Not found' },
        },
      },
      delete: {
        tags: ['Recommendations'],
        summary: 'Delete recommendation',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'OK' },
          404: { description: 'Not found' },
        },
      },
    },
    '/chatbot/chat': {
      post: {
        tags: ['Chatbot'],
        summary: 'Chat with AI assistant',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['message'],
                properties: {
                  message: { type: 'string', example: 'Tư vấn giúp tôi giày chạy bộ' },
                  productIds: {
                    type: 'array',
                    items: { type: 'string' },
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'OK',
            content: {
              'application/json': {
                schema: { type: 'object' },
              },
            },
          },
          401: { description: 'Unauthorized' },
          500: { description: 'Server error' },
        },
      },
    },
    '/chatbot/history': {
      get: {
        tags: ['Chatbot'],
        summary: 'Get my chatbot history',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'OK',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/ChatbotLog' },
                },
              },
            },
          },
          401: { description: 'Unauthorized' },
          500: { description: 'Server error' },
        },
      },
    },
    '/chatbot-logs': {
      get: {
        tags: ['ChatbotLogs'],
        summary: 'Get all chatbot logs',
        responses: {
          200: {
            description: 'OK',
            content: {
              'application/json': {
                schema: { type: 'array', items: { $ref: '#/components/schemas/ChatbotLog' } },
              },
            },
          },
        },
      },
      post: {
        tags: ['ChatbotLogs'],
        summary: 'Create chatbot log',
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/ChatbotLogRequest' } },
          },
        },
        responses: {
          201: {
            description: 'Created',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ChatbotLog' } },
            },
          },
        },
      },
    },
    '/chatbot-logs/{id}': {
      get: {
        tags: ['ChatbotLogs'],
        summary: 'Get chatbot log by ID',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: {
            description: 'OK',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ChatbotLog' } },
            },
          },
          404: { description: 'Not found' },
        },
      },
      put: {
        tags: ['ChatbotLogs'],
        summary: 'Update chatbot log',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/ChatbotLogRequest' } },
          },
        },
        responses: {
          200: {
            description: 'OK',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ChatbotLog' } },
            },
          },
          404: { description: 'Not found' },
        },
      },
      delete: {
        tags: ['ChatbotLogs'],
        summary: 'Delete chatbot log',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'OK' },
          404: { description: 'Not found' },
        },
      },
    },
    '/ai-behavior-logs': {
      get: {
        tags: ['AIBehaviorLogs'],
        summary: 'Get all AI behavior logs (admin)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'flow', in: 'query', schema: { type: 'string' } },
          { name: 'action', in: 'query', schema: { type: 'string' } },
          { name: 'userId', in: 'query', schema: { type: 'string' } },
          { name: 'limit', in: 'query', schema: { type: 'number', example: 50 } },
        ],
        responses: {
          200: {
            description: 'OK',
            content: {
              'application/json': {
                schema: { type: 'array', items: { $ref: '#/components/schemas/AIBehaviorLog' } },
              },
            },
          },
          401: { description: 'Unauthorized' },
          403: { description: 'Forbidden' },
        },
      },
      post: {
        tags: ['AIBehaviorLogs'],
        summary: 'Create AI behavior log',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/AIBehaviorLogRequest' } },
          },
        },
        responses: {
          201: {
            description: 'Created',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/AIBehaviorLog' } },
            },
          },
          400: { description: 'Bad request' },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/ai-behavior-logs/me': {
      get: {
        tags: ['AIBehaviorLogs'],
        summary: 'Get my AI behavior logs',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'flow', in: 'query', schema: { type: 'string' } },
          { name: 'action', in: 'query', schema: { type: 'string' } },
          { name: 'limit', in: 'query', schema: { type: 'number', example: 50 } },
        ],
        responses: {
          200: {
            description: 'OK',
            content: {
              'application/json': {
                schema: { type: 'array', items: { $ref: '#/components/schemas/AIBehaviorLog' } },
              },
            },
          },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/ai-behavior-logs/{id}': {
      get: {
        tags: ['AIBehaviorLogs'],
        summary: 'Get AI behavior log by ID (admin)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: {
            description: 'OK',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/AIBehaviorLog' } },
            },
          },
          401: { description: 'Unauthorized' },
          403: { description: 'Forbidden' },
          404: { description: 'Not found' },
        },
      },
      delete: {
        tags: ['AIBehaviorLogs'],
        summary: 'Delete AI behavior log (admin)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'OK' },
          401: { description: 'Unauthorized' },
          403: { description: 'Forbidden' },
          404: { description: 'Not found' },
        },
      },
    },
    '/carts/my': {
      get: {
        tags: ['Carts'],
        summary: 'Get my cart',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'OK',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/CartMyResponse' } },
            },
          },
          401: { description: 'Unauthorized' },
        },
      },
    },    '/carts': {
      get: {
        tags: ['Carts'],
        summary: 'Get all carts',
        responses: {
          200: {
            description: 'OK',
            content: {
              'application/json': {
                schema: { type: 'array', items: { $ref: '#/components/schemas/Cart' } },
              },
            },
          },
        },
      },
      post: {
        tags: ['Carts'],
        summary: 'Create cart',
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/CartRequest' } },
          },
        },
        responses: {
          201: {
            description: 'Created',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/Cart' } },
            },
          },
        },
      },
    },
    '/carts/{id}': {
      get: {
        tags: ['Carts'],
        summary: 'Get cart by ID',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: {
            description: 'OK',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/Cart' } },
            },
          },
          404: { description: 'Not found' },
        },
      },
      put: {
        tags: ['Carts'],
        summary: 'Update cart',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/CartRequest' } },
          },
        },
        responses: {
          200: {
            description: 'OK',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/Cart' } },
            },
          },
          404: { description: 'Not found' },
        },
      },
      delete: {
        tags: ['Carts'],
        summary: 'Delete cart',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'OK' },
          404: { description: 'Not found' },
        },
      },
    },
    '/cart-items': {
      get: {
        tags: ['CartItems'],
        summary: 'Get all cart items',
        responses: {
          200: {
            description: 'OK',
            content: {
              'application/json': {
                schema: { type: 'array', items: { $ref: '#/components/schemas/CartItem' } },
              },
            },
          },
        },
      },
      post: {
        tags: ['CartItems'],
        summary: 'Create cart item',
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/CartItemRequest' } },
          },
        },
        responses: {
          201: {
            description: 'Created',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/CartItem' } },
            },
          },
        },
      },
    },
    '/cart-items/{id}': {
      get: {
        tags: ['CartItems'],
        summary: 'Get cart item by ID',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: {
            description: 'OK',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/CartItem' } },
            },
          },
          404: { description: 'Not found' },
        },
      },
      put: {
        tags: ['CartItems'],
        summary: 'Update cart item',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/CartItemRequest' } },
          },
        },
        responses: {
          200: {
            description: 'OK',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/CartItem' } },
            },
          },
          404: { description: 'Not found' },
        },
      },
      delete: {
        tags: ['CartItems'],
        summary: 'Delete cart item',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'OK' },
          404: { description: 'Not found' },
        },
      },
    },
    '/orders': {
      get: {
        tags: ['Orders'],
        summary: 'Get all orders',
        responses: {
          200: {
            description: 'OK',
            content: {
              'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Order' } } },
            },
          },
        },
      },
      post: {
        tags: ['Orders'],
        summary: 'Create order',
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/OrderCreateRequest' } },
          },
        },
        responses: {
          201: {
            description: 'Created',
            content: {
              'application/json': { schema: { type: 'object' } },
            },
          },
        },
      },
    },
    '/orders/{id}': {
      get: {
        tags: ['Orders'],
        summary: 'Get order by ID',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'OK', content: { 'application/json': { schema: { type: 'object' } } } },
          404: { description: 'Not found' },
        },
      },
      put: {
        tags: ['Orders'],
        summary: 'Update order',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/OrderUpdateRequest' } },
          },
        },
        responses: {
          200: { description: 'OK', content: { 'application/json': { schema: { type: 'object' } } } },
          404: { description: 'Not found' },
        },
      },
      delete: {
        tags: ['Orders'],
        summary: 'Delete order',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'OK' },
          404: { description: 'Not found' },
        },
      },
    },
    '/order-items': {
      get: {
        tags: ['OrderItems'],
        summary: 'Get all order items',
        responses: {
          200: {
            description: 'OK',
            content: {
              'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/OrderItem' } } },
            },
          },
        },
      },
      post: {
        tags: ['OrderItems'],
        summary: 'Create order item',
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/OrderItemRequest' } },
          },
        },
        responses: {
          201: {
            description: 'Created',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/OrderItem' } },
            },
          },
        },
      },
    },
    '/order-items/{id}': {
      get: {
        tags: ['OrderItems'],
        summary: 'Get order item by ID',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: {
            description: 'OK',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/OrderItem' } },
            },
          },
          404: { description: 'Not found' },
        },
      },
      put: {
        tags: ['OrderItems'],
        summary: 'Update order item',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/OrderItemRequest' } },
          },
        },
        responses: {
          200: {
            description: 'OK',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/OrderItem' } },
            },
          },
          404: { description: 'Not found' },
        },
      },
      delete: {
        tags: ['OrderItems'],
        summary: 'Delete order item',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'OK' },
          404: { description: 'Not found' },
        },
      },
    },
    '/payments': {
      get: {
        tags: ['Payments'],
        summary: 'Get all payments',
        responses: {
          200: {
            description: 'OK',
            content: {
              'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Payment' } } },
            },
          },
        },
      },
      post: {
        tags: ['Payments'],
        summary: 'Create payment',
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/PaymentRequest' } },
          },
        },
        responses: {
          201: {
            description: 'Created',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/Payment' } },
            },
          },
        },
      },
    },
    '/payments/{id}': {
      get: {
        tags: ['Payments'],
        summary: 'Get payment by ID',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: {
            description: 'OK',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/Payment' } },
            },
          },
          404: { description: 'Not found' },
        },
      },
      put: {
        tags: ['Payments'],
        summary: 'Update payment',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/PaymentRequest' } },
          },
        },
        responses: {
          200: {
            description: 'OK',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/Payment' } },
            },
          },
          404: { description: 'Not found' },
        },
      },
      delete: {
        tags: ['Payments'],
        summary: 'Delete payment',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'OK' },
          404: { description: 'Not found' },
        },
      },
    },
    '/vnpay/create': {
      post: {
        tags: ['VNPay'],
        summary: 'Create VNPay payment URL',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/VnpayCreateRequest' } },
          },
        },
        responses: {
          200: {
            description: 'OK',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/VnpayCreateResponse' } },
            },
          },
          400: { description: 'Bad request' },
          401: { description: 'Unauthorized' },
          403: { description: 'Forbidden' },
          404: { description: 'Order not found' },
        },
      },
    },
    '/vnpay/return': {
      get: {
        tags: ['VNPay'],
        summary: 'Handle VNPay return URL',
        security: [],
        parameters: [
          { name: 'vnp_TxnRef', in: 'query', schema: { type: 'string' } },
          { name: 'vnp_Amount', in: 'query', schema: { type: 'string' } },
          { name: 'vnp_ResponseCode', in: 'query', schema: { type: 'string' } },
          { name: 'vnp_TransactionNo', in: 'query', schema: { type: 'string' } },
          { name: 'vnp_SecureHash', in: 'query', schema: { type: 'string' } },
        ],
        responses: {
          200: {
            description: 'OK',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/VnpayReturnResponse' } },
            },
          },
          400: { description: 'Invalid VNPay return data' },
        },
      },
    },
    '/vnpay/ipn': {
      get: {
        tags: ['VNPay'],
        summary: 'Handle VNPay IPN callback',
        security: [],
        parameters: [
          { name: 'vnp_TxnRef', in: 'query', schema: { type: 'string' } },
          { name: 'vnp_Amount', in: 'query', schema: { type: 'string' } },
          { name: 'vnp_ResponseCode', in: 'query', schema: { type: 'string' } },
          { name: 'vnp_TransactionNo', in: 'query', schema: { type: 'string' } },
          { name: 'vnp_SecureHash', in: 'query', schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'OK' },
        },
      },
    },
  },
};

export default swaggerSpec;





