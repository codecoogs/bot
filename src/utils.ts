import { GuildMember } from "discord.js";
import fs from "node:fs";
import path from "node:path";
import roles from "./constants/roles";

export const getFolderPath = (folderName: string) => {
  return path.join(__dirname, folderName);
};

export const getFilesFromFolder = (folderPath: string) => {
  return fs
    .readdirSync(folderPath)
    .filter((file: string) => file.endsWith(".ts") || file.endsWith(".js"));
};

export const getDefaultObject = (folderPath: string, file: string) => {
  const filePath = path.join(folderPath, file);

  return require(filePath).default;
};

export const giveRole = (member: GuildMember, roleName: string) => {
  const role = member.guild.roles.cache.find((role) => role.name == roleName);
  if (role) {
    member.roles.add(role);
  }
};

export const getRoleById = (id: string) => {
  for (const key in roles) {
    const roleData = roles[key as keyof typeof roles]
    for (let index = 0; index < roleData.length; index++) {
      const classification = roleData[index];

      if (classification.id == id) return classification.name;
    }
  }
};
