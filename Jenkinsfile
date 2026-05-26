pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Setup Node.js 20 via nvm') {
            steps {
                sh '''
                # Install nvm (local user install, no sudo)
                curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
                export NVM_DIR="$HOME/.nvm"
                [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
                nvm install 20
                nvm use 20
                node -v
                npm -v
                '''
            }
        }

        stage('Install dependencies') {
            steps {
                sh 'npm ci'
            }
        }

        stage('Lint') {
            steps {
                sh 'npm run lint'
            }
        }

        stage('Unit Tests') {
            steps {
                sh 'npm test -- test/unit/'
            }
        }

        stage('Integration Tests') {
            steps {
                sh 'npm test -- test/integration/'
            }
        }

        stage('Coverage') {
            steps {
                sh 'npm test -- --coverage'
            }
        }
    }

    post {
        always {
            archiveArtifacts artifacts: 'coverage/**', allowEmptyArchive: true
        }
        success {
            echo '✅ Build réussie !'
        }
        failure {
            echo '❌ Build échouée !'
        }
    }
}
