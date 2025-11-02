/**
 * Message localization system
 * Loads messages from JSON files and provides template replacement
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

interface Messages {
  welcome: {
    new_client: string;
    returning_client: string;
    topic_recreated: string;
  };
  errors: {
    unable_to_identify: string;
    general_error: string;
    message_send_failed: string;
    need_start_first: string;
    failed_to_forward: string;
  };
  help: {
    client: string;
    team: string;
  };
  notifications: {
    new_client_topic: string;
    client_reconnected: string;
    team_message_prefix: string;
  };
  console: {
    topic_created: string;
    topic_deleted_recreating: string;
    message_forwarded_to_topic: string;
    message_forwarded_to_client: string;
  };
}

class MessageManager {
  private messages: Messages;
  private locale: string;

  constructor(locale: string = "ru") {
    this.locale = locale;
    this.messages = this.loadMessages(locale);
  }

  private loadMessages(locale: string): Messages {
    try {
      const filePath = path.join(__dirname, `${locale}.json`);
      const fileContent = fs.readFileSync(filePath, "utf-8");
      return JSON.parse(fileContent);
    } catch (error) {
      console.error(`Failed to load messages for locale: ${locale}`, error);
      // Fallback to English
      if (locale !== "en") {
        return this.loadMessages("en");
      }
      throw error;
    }
  }

  /**
   * Replace template variables in a string
   * Example: "Hello {{name}}" with {name: "John"} => "Hello John"
   */
  private replaceVariables(
    template: string,
    variables: Record<string, string | number>
  ): string {
    let result = template;
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, "g");
      result = result.replace(regex, String(value));
    }
    return result;
  }

  // Welcome messages
  newClient(firstName: string): string {
    return this.replaceVariables(this.messages.welcome.new_client, {
      firstName,
    });
  }

  returningClient(firstName: string): string {
    return this.replaceVariables(this.messages.welcome.returning_client, {
      firstName,
    });
  }

  topicRecreated(firstName: string): string {
    return this.replaceVariables(this.messages.welcome.topic_recreated, {
      firstName,
    });
  }

  // Error messages
  get unableToIdentify(): string {
    return this.messages.errors.unable_to_identify;
  }

  get generalError(): string {
    return this.messages.errors.general_error;
  }

  get messageSendFailed(): string {
    return this.messages.errors.message_send_failed;
  }

  get needStartFirst(): string {
    return this.messages.errors.need_start_first;
  }

  get failedToForward(): string {
    return this.messages.errors.failed_to_forward;
  }

  // Help messages
  get clientHelp(): string {
    return this.messages.help.client;
  }

  get teamHelp(): string {
    return this.messages.help.team;
  }

  // Notifications
  newClientTopic(
    firstName: string,
    username: string,
    userId: number,
    timestamp: string
  ): string {
    const usernameText = username ? `📱 Username: @${username}\n` : "";
    return this.replaceVariables(this.messages.notifications.new_client_topic, {
      firstName,
      username: usernameText,
      userId,
      timestamp,
    });
  }

  clientReconnected(
    firstName: string,
    username: string,
    userId: number,
    timestamp: string
  ): string {
    const usernameText = username ? `(@${username})` : "";
    return this.replaceVariables(
      this.messages.notifications.client_reconnected,
      {
        firstName,
        username: usernameText,
        userId,
        timestamp,
      }
    );
  }

  teamMessagePrefix(teamMemberName: string, teamUsername?: string): string {
    const usernameText = teamUsername ? ` (@${teamUsername})` : "";
    return this.replaceVariables(
      this.messages.notifications.team_message_prefix,
      {
        teamMemberName,
        teamUsername: usernameText,
      }
    );
  }

  // Console messages
  consoleTopicCreated(userId: number, topicName: string): string {
    return this.replaceVariables(this.messages.console.topic_created, {
      userId,
      topicName,
    });
  }

  consoleTopicDeleted(topicId: number, userId: number): string {
    return this.replaceVariables(
      this.messages.console.topic_deleted_recreating,
      {
        topicId,
        userId,
      }
    );
  }

  consoleMessageToTopic(userId: number, topicId: number): string {
    return this.replaceVariables(
      this.messages.console.message_forwarded_to_topic,
      {
        userId,
        topicId,
      }
    );
  }

  consoleMessageToClient(userId: number): string {
    return this.replaceVariables(
      this.messages.console.message_forwarded_to_client,
      {
        userId,
      }
    );
  }
}

// Export singleton instance
export const messages = new MessageManager();

// Export class for testing or multi-locale support
export { MessageManager };

