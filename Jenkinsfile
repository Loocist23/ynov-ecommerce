pipeline {
    agent any

    environment {
        NODE_VERSION = '20'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Node.js 20') {
            steps {
                sh '''
                curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
                sudo apt-get install -y nodejs
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
