# Use the official RabbitMQ image with management UI
FROM rabbitmq:4.0.2-management

# Install curl for downloading the plugin
RUN apt-get update && apt-get install -y curl

# Download and install the RabbitMQ Delayed Message Exchange plugin
RUN curl -Lo /plugins/rabbitmq_delayed_message_exchange.ez https://github.com/rabbitmq/rabbitmq-delayed-message-exchange/releases/download/v4.0.2/rabbitmq_delayed_message_exchange-4.0.2.ez

# Enable the delayed message plugin
RUN rabbitmq-plugins enable --offline rabbitmq_delayed_message_exchange

# Expose necessary ports
EXPOSE 5672 15672

# Start RabbitMQ server
CMD ["rabbitmq-server"]
