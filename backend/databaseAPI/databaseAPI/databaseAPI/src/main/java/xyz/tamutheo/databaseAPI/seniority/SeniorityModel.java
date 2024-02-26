package xyz.tamutheo.databaseAPI.seniority;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SeniorityModel {
    Integer seniorityId;
    String seniorityName;
}