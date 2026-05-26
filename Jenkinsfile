#!/usr/bin/env groovy

/**
 * Jenkinsfile pour le projet ynov-ecommerce
 * 
 * Utilise la librairie partagée depuis shared-lib-jenkins
 * avec @Library pour réutiliser le code
 */

// 4️⃣ Charger la librairie partagée depuis le repo shared-lib-jenkins
// NOTE: Il faut configurer "shared-lib-jenkins" comme Global Library dans Jenkins
// (Manage Jenkins > Configure System > Global Pipeline Libraries)
// Spécification de la version (main ou develop selon ta branche)
@Library('shared-lib-jenkins@main') _

pipeline {
    agent any

    // ============================================
    // 2️⃣ VARIABLES D'ENVIRONNEMENT (les "vars")
    // ============================================
    environment {
        // Configuration Node.js
        NODE_VERSION = '20'
        
        // Configuration du projet
        PROJECT_NAME = 'ynov-ecommerce'
        
        // Configuration SonarCloud
        SONAR_KEY = 'Loocist23_ynov-ecommerce'
        SONAR_ORG = 'loocist23'
        SONAR_TOKEN_CREDENTIALS = 'SONAR_TOKEN'
        
        // Commandes
        LINT_COMMAND = 'npm run lint'
        
        // Chemins
        SOURCE_PATH = 'src/'
        COVERAGE_PATH = 'coverage/**'
    }

    stages {
        // ============================================
        // ÉTAPE 1 : Récupération du code
        // ============================================
        stage('Checkout') {
            steps {
                checkout scm
                script {
                    // Utilisation de la fonction de la librairie partagée
                    def testRunner = new testRunner()
                    testRunner.displayStatus("Code récupéré depuis le repository Git")
                }
            }
        }

        // ============================================
        // ÉTAPE 2 : Configuration de Node.js
        // ============================================
        stage('Setup Node.js') {
            steps {
                script {
                    def testRunner = new testRunner()
                    // Utilisation de la variable NODE_VERSION
                    testRunner.setupNodeEnvironment(env.NODE_VERSION)
                }
            }
        }

        // ============================================
        // ÉTAPE 3 : Installation des dépendances
        // ============================================
        stage('Install dependencies') {
            steps {
                script {
                    def testRunner = new testRunner()
                    testRunner.installDependencies(true) // clean install avec npm ci
                }
            }
        }

        // ============================================
        // ÉTAPE 4 : Linting
        // ============================================
        stage('Lint') {
            steps {
                script {
                    def testRunner = new testRunner()
                    // Utilisation de la variable LINT_COMMAND
                    def lintSuccess = testRunner.runLint(env.LINT_COMMAND)
                    
                    if (!lintSuccess) {
                        error("Linting échoué - corrigez les erreurs ESLint")
                    }
                }
            }
        }

        // ============================================
        // ÉTAPE 5 : Tests unitaires
        // ============================================
        stage('Unit Tests') {
            steps {
                script {
                    def testRunner = new testRunner()
                    // 2️⃣ Utilisation de la fonction executeTests de la librairie
                    def testsSuccess = testRunner.executeTests(
                        'npm test -- test/unit/',
                        'Unit Tests'
                    )
                    
                    if (!testsSuccess) {
                        error("Tests unitaires échoués")
                    }
                }
            }
        }

        // ============================================
        // ÉTAPE 6 : Tests d'intégration
        // ============================================
        stage('Integration Tests') {
            steps {
                script {
                    def testRunner = new testRunner()
                    // 2️⃣ Utilisation de la fonction executeTests de la librairie
                    def testsSuccess = testRunner.executeTests(
                        'npm test -- test/integration/',
                        'Integration Tests'
                    )
                    
                    if (!testsSuccess) {
                        error("Tests d'intégration échoués")
                    }
                }
            }
        }

        // ============================================
        // ÉTAPE 7 : Couverture de code
        // ============================================
        stage('Coverage') {
            steps {
                script {
                    def testRunner = new testRunner()
                    testRunner.executeTests('npm test -- --coverage', 'Coverage')
                }
            }
        }

        // ============================================
        // ÉTAPE 8 : SonarCloud
        // ============================================
        stage('SonarCloud') {
            steps {
                withCredentials([string(credentialsId: env.SONAR_TOKEN_CREDENTIALS, variable: 'SONAR_TOKEN')]) {
                    sh '''
                    export NVM_DIR="$HOME/.nvm"
                    [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
                    nvm use 20
                    npm install -g sonar-scanner
                    sonar-scanner -Dsonar.login=$SONAR_TOKEN -Dsonar.projectKey=${env.SONAR_KEY} -Dsonar.organization=${env.SONAR_ORG}
                    '''
                }
            }
        }
    }

    // ============================================
    // POST-ACTIONS
    // ============================================
    post {
        always {
            archiveArtifacts artifacts: env.COVERAGE_PATH, allowEmptyArchive: true
        }
        success {
            script {
                def testRunner = new testRunner()
                testRunner.displayStatus("✅ Build réussie pour ${env.PROJECT_NAME}!")
            }
        }
        failure {
            script {
                def testRunner = new testRunner()
                testRunner.displayStatus("❌ Build échouée pour ${env.PROJECT_NAME}!", false)
            }
        }
    }
}
