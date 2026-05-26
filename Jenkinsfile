pipeline {
    agent any

    environment {
        SONAR_KEY = 'Loocist23_ynov-ecommerce'
        SONAR_ORG = 'loocist23'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Setup Node.js 20') {
            steps {
                sh '''
                curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
                export NVM_DIR="$HOME/.nvm"
                [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
                nvm install 20
                nvm use 20
                '''
            }
        }

        stage('Install dependencies') {
            steps {
                sh '''
                export NVM_DIR="$HOME/.nvm"
                [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
                nvm use 20
                npm ci
                '''
            }
        }

        stage('Lint') {
            steps {
                sh '''
                export NVM_DIR="$HOME/.nvm"
                [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
                nvm use 20
                npm run lint
                '''
            }
        }

        stage('Unit Tests') {
            steps {
                sh '''
                export NVM_DIR="$HOME/.nvm"
                [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
                nvm use 20
                npm test -- test/unit/
                '''
            }
        }

        stage('Integration Tests') {
            steps {
                sh '''
                export NVM_DIR="$HOME/.nvm"
                [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
                nvm use 20
                npm test -- test/integration/
                '''
            }
        }

        stage('Coverage') {
            steps {
                sh '''
                export NVM_DIR="$HOME/.nvm"
                [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
                nvm use 20
                npm test -- --coverage
                '''
            }
        }

        stage('SonarCloud') {
            steps {
                sh '''
                export NVM_DIR="$HOME/.nvm"
                [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
                nvm use 20
                npm test -- --coverage
                '''
                withSonarQubeEnv('SonarCloud') {
                    sh 'sonar-scanner -Dsonar.login=${SONAR_TOKEN}'
                }
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
