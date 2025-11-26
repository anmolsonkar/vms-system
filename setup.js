const fs = require('fs');
const path = require('path');

const folderStructure = {
  'vms-system': {
    'src': {
      'app': {
        'api': {
          'auth': {
            'login': { 'route.ts': '' },
            'logout': { 'route.ts': '' },
            'verify': { 'route.ts': '' }
          },
          'superadmin': {
            'users': {
              'create': { 'route.ts': '' },
              'list': { 'route.ts': '' },
              'update': { 'route.ts': '' },
              'delete': { 'route.ts': '' }
            },
            'properties': {
              'create': { 'route.ts': '' },
              'list': { 'route.ts': '' }
            },
            'analytics': { 'route.ts': '' },
            'audit-logs': { 'route.ts': '' }
          },
          'resident': {
            'visitors': {
              'pending': { 'route.ts': '' },
              'approve': { 'route.ts': '' },
              'reject': { 'route.ts': '' },
              'history': { 'route.ts': '' },
              'mark-exit': { 'route.ts': '' }
            },
            'notifications': {
              'list': { 'route.ts': '' },
              'mark-read': { 'route.ts': '' },
              'unread-count': { 'route.ts': '' }
            }
          },
          'guard': {
            'visitors': {
              'pending-approval': { 'route.ts': '' },
              'approved': { 'route.ts': '' },
              'check-in': { 'route.ts': '' },
              'active': { 'route.ts': '' },
              'history': { 'route.ts': '' }
            },
            'manual-entry': { 'route.ts': '' },
            'notifications': { 'route.ts': '' }
          },
          'visitor': {
            'register': { 'route.ts': '' },
            'verify-otp': { 'route.ts': '' },
            'send-otp': { 'route.ts': '' },
            'upload': {
              'photo': { 'route.ts': '' },
              'id-card': { 'route.ts': '' }
            }
          },
          'notifications': {
            'poll': { 'route.ts': '' }
          },
          'qr': {
            'generate': { 'route.ts': '' }
          }
        },
        '(auth)': {
          'login': { 'page.tsx': '' },
          'layout.tsx': ''
        },
        '(dashboard)': {
          'superadmin': {
            'page.tsx': '',
            'users': { 'page.tsx': '' },
            'properties': { 'page.tsx': '' },
            'analytics': { 'page.tsx': '' },
            'audit-logs': { 'page.tsx': '' }
          },
          'resident': {
            'page.tsx': '',
            'approvals': { 'page.tsx': '' },
            'history': { 'page.tsx': '' },
            'notifications': { 'page.tsx': '' }
          },
          'guard': {
            'page.tsx': '',
            'pending': { 'page.tsx': '' },
            'active-visitors': { 'page.tsx': '' },
            'manual-entry': { 'page.tsx': '' },
            'history': { 'page.tsx': '' }
          },
          'layout.tsx': ''
        },
        'visitor': {
          'register': {
            '[propertyId]': { 'page.tsx': '' }
          }
        },
        'layout.tsx': '',
        'page.tsx': '',
        'globals.css': ''
      },
      'components': {
        'auth': {
          'LoginForm.tsx': '',
          'ProtectedRoute.tsx': ''
        },
        'superadmin': {
          'CreateUserModal.tsx': '',
          'UserTable.tsx': '',
          'PropertyManager.tsx': '',
          'AnalyticsDashboard.tsx': '',
          'AuditLogTable.tsx': ''
        },
        'resident': {
          'ApprovalCard.tsx': '',
          'VisitorHistory.tsx': '',
          'NotificationPanel.tsx': '',
          'ExitButton.tsx': ''
        },
        'guard': {
          'PendingApprovalCard.tsx': '',
          'ApprovedVisitorCard.tsx': '',
          'ActiveVisitorCard.tsx': '',
          'ManualEntryForm.tsx': '',
          'QRScanner.tsx': ''
        },
        'visitor': {
          'RegistrationForm.tsx': '',
          'CameraCapture.tsx': '',
          'OTPVerification.tsx': '',
          'IDCardUpload.tsx': ''
        },
        'shared': {
          'Navbar.tsx': '',
          'Sidebar.tsx': '',
          'NotificationBell.tsx': '',
          'LoadingSpinner.tsx': '',
          'Modal.tsx': '',
          'Card.tsx': '',
          'Button.tsx': '',
          'Input.tsx': '',
          'Select.tsx': '',
          'Badge.tsx': ''
        },
        'layout': {
          'DashboardLayout.tsx': '',
          'AuthLayout.tsx': ''
        }
      },
      'lib': {
        'db': {
          'mongoose.ts': '',
          'models': {
            'User.ts': '',
            'Property.ts': '',
            'Resident.ts': '',
            'Visitor.ts': '',
            'Visit.ts': '',
            'Notification.ts': '',
            'AuditLog.ts': ''
          }
        },
        'auth': {
          'jwt.ts': '',
          'middleware.ts': '',
          'session.ts': ''
        },
        'utils': {
          'otp.ts': '',
          'sms.ts': '',
          'whatsapp.ts': '',
          'upload.ts': '',
          'qr-generator.ts': '',
          'notification.ts': '',
          'validation.ts': ''
        },
        'hooks': {
          'useAuth.ts': '',
          'useNotifications.ts': '',
          'usePolling.ts': ''
        },
        'types': {
          'index.ts': '',
          'user.types.ts': '',
          'visitor.types.ts': '',
          'notification.types.ts': ''
        },
        'constants': {
          'roles.ts': '',
          'routes.ts': '',
          'status.ts': ''
        }
      },
      'middleware.ts': ''
    },
    'public': {
      'images': {
        'logo.png': ''
      },
      'qr': {}
    },
    '.env.local': '',
    '.env.example': '',
    '.gitignore': '',
    'next.config.js': '',
    'tsconfig.json': '',
    'tailwind.config.ts': '',
    'postcss.config.js': '',
    'package.json': '',
    'README.md': ''
  }
};

function createStructure(basePath, structure) {
  Object.keys(structure).forEach(name => {
    const currentPath = path.join(basePath, name);
    
    if (typeof structure[name] === 'object' && Object.keys(structure[name]).length > 0) {
      // It's a directory
      if (!fs.existsSync(currentPath)) {
        fs.mkdirSync(currentPath, { recursive: true });
        console.log(`📁 Created directory: ${currentPath}`);
      }
      createStructure(currentPath, structure[name]);
    } else {
      // It's a file
      const dir = path.dirname(currentPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      if (!fs.existsSync(currentPath)) {
        fs.writeFileSync(currentPath, '');
        console.log(`📄 Created file: ${currentPath}`);
      }
    }
  });
}

console.log('🚀 Starting VMS Project Setup...\n');
createStructure(process.cwd(), folderStructure);
console.log('\n✅ Project structure created successfully!');
console.log('\n📝 Next steps:');
console.log('1. cd vms-system');
console.log('2. npm install');
console.log('3. Copy the configuration files provided');
console.log('4. Update .env.local with your credentials');
console.log('5. npm run dev');