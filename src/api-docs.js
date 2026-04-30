// OpenAPI/Swagger documentation for Secure File Management System

const apiSpec = {
    openapi: '3.0.0',
    info: {
        title: 'Secure File Management System API',
        description: 'A Node.js backend demonstrating secure file operations with RBAC and ABAC using only built-in modules',
        version: '1.0.0',
        contact: {
            name: 'API Support',
            email: 'support@example.com'
        }
    },
    servers: [
        {
            url: 'http://localhost:3001',
            description: 'Development server'
        }
    ],
    paths: {
        '/login': {
            post: {
                tags: ['Authentication'],
                summary: 'User authentication',
                description: 'Authenticate user and return session token',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['username', 'password'],
                                properties: {
                                    username: {
                                        type: 'string',
                                        description: 'User username',
                                        example: 'alice'
                                    },
                                    password: {
                                        type: 'string',
                                        description: 'User password',
                                        example: 'password123'
                                    }
                                }
                            }
                        }
                    }
                },
                responses: {
                    200: {
                        description: 'Login successful',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean' },
                                        token: { type: 'string' },
                                        user: {
                                            type: 'object',
                                            properties: {
                                                username: { type: 'string' },
                                                roles: { type: 'array', items: { type: 'string' } },
                                                clearance: { type: 'number' }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    401: {
                        description: 'Authentication failed',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean' },
                                        error: { type: 'string' }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        '/logout': {
            post: {
                tags: ['Authentication'],
                summary: 'User logout',
                description: 'Destroy user session',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['token'],
                                properties: {
                                    token: {
                                        type: 'string',
                                        description: 'Session token to destroy'
                                    }
                                }
                            }
                        }
                    }
                },
                responses: {
                    200: {
                        description: 'Logout successful',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean' }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        '/file/read': {
            get: {
                tags: ['File Operations'],
                summary: 'Read file content',
                description: 'Read file content with authorization check',
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: 'filename',
                        in: 'query',
                        required: true,
                        schema: { type: 'string' },
                        description: 'Name of file to read'
                    }
                ],
                responses: {
                    200: {
                        description: 'File read successful',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean' },
                                        content: { type: 'string' },
                                        metadata: {
                                            type: 'object',
                                            properties: {
                                                size: { type: 'number' },
                                                created: { type: 'string' },
                                                modified: { type: 'string' },
                                                accessed: { type: 'string' }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    401: {
                        description: 'Unauthorized - No token provided'
                    },
                    403: {
                        description: 'Forbidden - Insufficient permissions'
                    },
                    404: {
                        description: 'File not found'
                    }
                }
            }
        },
        '/file/write': {
            post: {
                tags: ['File Operations'],
                summary: 'Write file content',
                description: 'Write content to file with authorization check',
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['filename', 'content'],
                                properties: {
                                    filename: {
                                        type: 'string',
                                        description: 'Name of file to write'
                                    },
                                    content: {
                                        type: 'string',
                                        description: 'Content to write to file'
                                    }
                                }
                            }
                        }
                    }
                },
                responses: {
                    200: {
                        description: 'File written successfully',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean' },
                                        metadata: {
                                            type: 'object',
                                            properties: {
                                                size: { type: 'number' },
                                                created: { type: 'string' },
                                                modified: { type: 'string' }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    401: {
                        description: 'Unauthorized - No token provided'
                    },
                    403: {
                        description: 'Forbidden - Insufficient permissions'
                    }
                }
            }
        },
        '/file/delete': {
            delete: {
                tags: ['File Operations'],
                summary: 'Delete file',
                description: 'Delete file with authorization check',
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: 'filename',
                        in: 'query',
                        required: true,
                        schema: { type: 'string' },
                        description: 'Name of file to delete'
                    }
                ],
                responses: {
                    200: {
                        description: 'File deleted successfully',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean' },
                                        message: { type: 'string' }
                                    }
                                }
                            }
                        }
                    },
                    401: {
                        description: 'Unauthorized - No token provided'
                    },
                    403: {
                        description: 'Forbidden - Insufficient permissions'
                    },
                    404: {
                        description: 'File not found'
                    }
                }
            }
        },
        '/dir/create': {
            post: {
                tags: ['Directory Operations'],
                summary: 'Create directory',
                description: 'Create directory with authorization check',
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['dirname'],
                                properties: {
                                    dirname: {
                                        type: 'string',
                                        description: 'Name of directory to create'
                                    }
                                }
                            }
                        }
                    }
                },
                responses: {
                    200: {
                        description: 'Directory created successfully',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean' },
                                        metadata: {
                                            type: 'object',
                                            properties: {
                                                created: { type: 'string' },
                                                modified: { type: 'string' }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    401: {
                        description: 'Unauthorized - No token provided'
                    },
                    403: {
                        description: 'Forbidden - Insufficient permissions'
                    }
                }
            }
        },
        '/dir/delete': {
            delete: {
                tags: ['Directory Operations'],
                summary: 'Delete directory',
                description: 'Delete directory with authorization check',
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: 'dirname',
                        in: 'query',
                        required: true,
                        schema: { type: 'string' },
                        description: 'Name of directory to delete'
                    }
                ],
                responses: {
                    200: {
                        description: 'Directory deleted successfully',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean' },
                                        message: { type: 'string' }
                                    }
                                }
                            }
                        }
                    },
                    401: {
                        description: 'Unauthorized - No token provided'
                    },
                    403: {
                        description: 'Forbidden - Insufficient permissions'
                    },
                    404: {
                        description: 'Directory not found'
                    }
                }
            }
        },
        '/dir/list': {
            get: {
                tags: ['Directory Operations'],
                summary: 'List directory contents',
                description: 'List directory contents with authorization check',
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: 'dirname',
                        in: 'query',
                        required: false,
                        schema: { type: 'string' },
                        description: 'Name of directory to list (default: current directory)'
                    }
                ],
                responses: {
                    200: {
                        description: 'Directory listing successful',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean' },
                                        path: { type: 'string' },
                                        items: {
                                            type: 'array',
                                            items: {
                                                type: 'object',
                                                properties: {
                                                    name: { type: 'string' },
                                                    type: { type: 'string', enum: ['file', 'directory'] },
                                                    size: { type: 'number' },
                                                    created: { type: 'string' },
                                                    modified: { type: 'string' },
                                                    accessed: { type: 'string' }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    401: {
                        description: 'Unauthorized - No token provided'
                    },
                    403: {
                        description: 'Forbidden - Insufficient permissions'
                    }
                }
            }
        },
        '/demo/sync': {
            get: {
                tags: ['Demonstrations'],
                summary: 'Synchronous operations demo',
                description: 'Demonstrate synchronous file operations',
                responses: {
                    200: {
                        description: 'Demo completed',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean' },
                                        content: { type: 'string' },
                                        stats: { type: 'object' },
                                        duration: { type: 'number' },
                                        blocking: { type: 'boolean' }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        '/demo/async': {
            get: {
                tags: ['Demonstrations'],
                summary: 'Asynchronous operations demo',
                description: 'Demonstrate asynchronous file operations',
                responses: {
                    200: {
                        description: 'Demo completed',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean' },
                                        content: { type: 'string' },
                                        stats: { type: 'object' },
                                        duration: { type: 'number' },
                                        blocking: { type: 'boolean' }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        '/demo/performance': {
            get: {
                tags: ['Demonstrations'],
                summary: 'Performance comparison',
                description: 'Compare synchronous vs asynchronous operations performance',
                parameters: [
                    {
                        name: 'iterations',
                        in: 'query',
                        required: false,
                        schema: { type: 'integer', default: 10 },
                        description: 'Number of iterations for performance test'
                    }
                ],
                responses: {
                    200: {
                        description: 'Performance comparison completed',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        sync: {
                                            type: 'object',
                                            properties: {
                                                duration: { type: 'number' },
                                                avgPerOperation: { type: 'number' }
                                            }
                                        },
                                        async: {
                                            type: 'object',
                                            properties: {
                                                duration: { type: 'number' },
                                                avgPerOperation: { type: 'number' }
                                            }
                                        },
                                        improvement: { type: 'string' }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        '/sessions': {
            get: {
                tags: ['Administration'],
                summary: 'List active sessions',
                description: 'List all active sessions (admin only)',
                security: [{ bearerAuth: [] }],
                responses: {
                    200: {
                        description: 'Sessions listed successfully',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        sessions: {
                                            type: 'array',
                                            items: {
                                                type: 'object',
                                                properties: {
                                                    token: { type: 'string' },
                                                    username: { type: 'string' },
                                                    createdAt: { type: 'string' },
                                                    expiresAt: { type: 'string' },
                                                    lastAccessed: { type: 'string' }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    401: {
                        description: 'Unauthorized - No token provided'
                    },
                    403: {
                        description: 'Forbidden - Insufficient permissions'
                    }
                }
            }
        }
    },
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
                description: 'Session token obtained from /login endpoint'
            }
        },
        schemas: {
            User: {
                type: 'object',
                properties: {
                    username: { type: 'string' },
                    roles: { type: 'array', items: { type: 'string' } },
                    clearance: { type: 'number' }
                }
            },
            Error: {
                type: 'object',
                properties: {
                    success: { type: 'boolean', example: false },
                    error: { type: 'string' }
                }
            },
            FileInfo: {
                type: 'object',
                properties: {
                    name: { type: 'string' },
                    size: { type: 'number' },
                    created: { type: 'string' },
                    modified: { type: 'string' },
                    accessed: { type: 'string' }
                }
            }
        }
    },
    tags: [
        {
            name: 'Authentication',
            description: 'User authentication and session management'
        },
        {
            name: 'File Operations',
            description: 'Secure file operations with authorization'
        },
        {
            name: 'Directory Operations',
            description: 'Secure directory operations with authorization'
        },
        {
            name: 'Demonstrations',
            description: 'Performance and operation demonstrations'
        },
        {
            name: 'Administration',
            description: 'Administrative functions'
        }
    ]
};

module.exports = apiSpec;
