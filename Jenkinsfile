pipeline {
    agent {
        label 'crew-keystone'
    }
    tools { nodejs '8.11.3' }
    stages {
        stage('Checkout') {
          steps {
            checkout scm
          }
        }

        stage('Installing dependencies') {
            steps {
                sh 'yarn'
            }
        }

        stage('Running tests') {
          steps {
            sh 'yarn test'
          }
        }

        stage('Build') {
            steps {
                sh 'yarn run build'
            }
        }

        stage('Deploy') {
            steps {
                sh 'tools/cdn.sh'
            }
        }
    }

    post {
      // Always runs. And it runs before any of the other post conditions.
      always {
        // Let's wipe out the workspace before we finish!
        deleteDir()
      }
    }

    // The options directive is for configuration that applies to the whole job.
    options {
      // For example, we'd like to make sure we only keep 10 builds at a time, so
      // we don't fill up our storage!
      buildDiscarder(logRotator(numToKeepStr:'10'))

      // And we'd really like to be sure that this build doesn't hang forever, so
      // let's time it out after an hour.
      timeout(time: 30, unit: 'MINUTES')
    }
}
